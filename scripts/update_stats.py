import os
import sys
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone

def fetch_json(url, post_data=None, headers=None):
    if headers is None:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    
    req = urllib.request.Request(url, data=post_data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error fetching {url}: {e.code} {e.reason}", file=sys.stderr)
        print(f"Response headers: {e.headers}", file=sys.stderr)
        try:
            body = e.read().decode('utf-8', errors='ignore')
            print(f"Response body (first 500 chars): {body[:500]}", file=sys.stderr)
        except Exception as read_err:
            print(f"Failed to read error body: {read_err}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"Error fetching {url}: {e}", file=sys.stderr)
        return None

def update_tryhackme(username="gvbytes"):
    outfile = "data/tryhackme.json"
    os.makedirs("data", exist_ok=True)
    
    # Load existing data if possible
    existing = {}
    if os.path.exists(outfile):
        try:
            with open(outfile, 'r') as f:
                existing = json.load(f)
        except Exception as e:
            print(f"Error reading existing TryHackMe data: {e}", file=sys.stderr)

    # Fetch badges
    badges_raw = fetch_json(f"https://tryhackme.com/api/badges/get/{username}")
    badges = []
    if isinstance(badges_raw, list):
        for b in badges_raw:
            if isinstance(b, dict) and 'name' in b:
                badges.append(b['name'])
    elif existing.get('badges'):
        badges = existing['badges']

    # Fetch rank info
    rank_raw = fetch_json(f"https://tryhackme.com/api/user/rank/{username}")
    rank = None
    if isinstance(rank_raw, dict):
        rank = rank_raw.get('userRank')
    if rank is None and existing.get('rank'):
        rank = existing['rank']

    # Fetch completed rooms count
    rooms_raw = fetch_json(f"https://tryhackme.com/api/no-completed-rooms-public/{username}")
    rooms_completed = None
    if isinstance(rooms_raw, int):
        rooms_completed = rooms_raw
    elif isinstance(rooms_raw, str) and rooms_raw.isdigit():
        rooms_completed = int(rooms_raw)
    
    # Fetch room list
    room_list_raw = fetch_json(f"https://tryhackme.com/api/all-completed-rooms?username={username}")
    completed_rooms = []
    if isinstance(room_list_raw, list):
        for room in room_list_raw:
            if isinstance(room, dict):
                title = room.get('title', room.get('name', 'Unknown'))
                completed_rooms.append({'title': title, 'status': 'completed'})
    elif existing.get('completed_rooms'):
        completed_rooms = existing['completed_rooms']

    if rooms_completed is None:
        rooms_completed = existing.get('rooms_completed', len(completed_rooms))

    # Fallback to defaults if completely empty
    if not completed_rooms:
        completed_rooms = [
            {'title': 'Offensive Security Intro', 'status': 'completed'},
            {'title': 'Defensive Security Intro', 'status': 'completed'}
        ]
        rooms_completed = 2

    # Download TryHackMe live badge
    badge_path = None
    badge_url = f"https://tryhackme.com/badge/{username}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    req = urllib.request.Request(badge_url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            content_type = response.headers.get('Content-Type', '')
            data = response.read()
            ext = 'svg' if 'svg' in content_type.lower() else 'png'
            badge_outfile = f"data/tryhackme_badge.{ext}"
            with open(badge_outfile, 'wb') as f:
                f.write(data)
            badge_path = badge_outfile
            print(f"Successfully downloaded badge to {badge_outfile}")
            
            # Clean up other format if it exists
            other_ext = 'png' if ext == 'svg' else 'svg'
            other_file = f"data/tryhackme_badge.{other_ext}"
            if os.path.exists(other_file):
                try: os.remove(other_file)
                except: pass
    except Exception as e:
        print(f"Error downloading TryHackMe badge image: {e}", file=sys.stderr)
        if existing.get('badge_image_path') and os.path.exists(existing['badge_image_path']):
            badge_path = existing['badge_image_path']

    result = {
        'username': username,
        'profile_url': f"https://tryhackme.com/p/{username}",
        'rank': rank,
        'rooms_completed': rooms_completed,
        'badges': badges,
        'completed_rooms': completed_rooms,
        'badge_image_path': badge_path,
        'last_updated': datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    }

    with open(outfile, 'w') as f:
        json.dump(result, f, indent=2)
        f.write('\n')
    print(f"Updated TryHackMe: {rooms_completed} rooms, {len(badges)} badges.")

def update_leetcode(username="gvbytes"):
    outfile = "data/leetcode.json"
    os.makedirs("data", exist_ok=True)

    # Load existing data if possible
    existing = {}
    if os.path.exists(outfile):
        try:
            with open(outfile, 'r') as f:
                existing = json.load(f)
        except Exception as e:
            print(f"Error reading existing LeetCode data: {e}", file=sys.stderr)

    url = 'https://leetcode.com/graphql'
    query = """
    query userProblemsSolved($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        profile {
          ranking
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
    """
    post_data = json.dumps({'query': query, 'variables': {'username': username}}).encode('utf-8')
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    res = fetch_json(url, post_data=post_data, headers=headers)
    
    total_solved = 0
    easy_solved = 0
    medium_solved = 0
    hard_solved = 0
    
    total_easy = 951
    total_medium = 2074
    total_hard = 947
    ranking = None

    if res and 'data' in res:
        data = res['data']
        # Parse total question counts
        all_counts = data.get('allQuestionsCount', [])
        for item in all_counts:
            diff = item.get('difficulty')
            cnt = item.get('count', 0)
            if diff == 'Easy':
                total_easy = cnt
            elif diff == 'Medium':
                total_medium = cnt
            elif diff == 'Hard':
                total_hard = cnt

        # Parse user stats
        mu = data.get('matchedUser')
        if mu:
            prof = mu.get('profile') or {}
            ranking = prof.get('ranking')
            
            sub_stats = mu.get('submitStats') or {}
            ac_sub = sub_stats.get('acSubmissionNum', [])
            for item in ac_sub:
                diff = item.get('difficulty')
                cnt = item.get('count', 0)
                if diff == 'All':
                    total_solved = cnt
                elif diff == 'Easy':
                    easy_solved = cnt
                elif diff == 'Medium':
                    medium_solved = cnt
                elif diff == 'Hard':
                    hard_solved = cnt
    else:
        # Fallback to existing
        total_solved = existing.get('total_solved', 0)
        easy_solved = existing.get('easy_solved', 0)
        medium_solved = existing.get('medium_solved', 0)
        hard_solved = existing.get('hard_solved', 0)
        total_easy = existing.get('total_easy', total_easy)
        total_medium = existing.get('total_medium', total_medium)
        total_hard = existing.get('total_hard', total_hard)
        ranking = existing.get('ranking')

    result = {
        'username': username,
        'profile_url': f"https://leetcode.com/u/{username}/",
        'total_solved': total_solved,
        'easy_solved': easy_solved,
        'medium_solved': medium_solved,
        'hard_solved': hard_solved,
        'total_easy': total_easy,
        'total_medium': total_medium,
        'total_hard': total_hard,
        'ranking': ranking,
        'last_updated': datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    }

    with open(outfile, 'w') as f:
        json.dump(result, f, indent=2)
        f.write('\n')
    print(f"Updated LeetCode: {total_solved} solved (Easy: {easy_solved}, Med: {medium_solved}, Hard: {hard_solved}).")

if __name__ == '__main__':
    update_tryhackme()
    update_leetcode()
