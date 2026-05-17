import urllib.request
import json

def test_connectivity():
    print("Checking Local Server Status...")
    
    # 1. Check Backend Health
    try:
        req = urllib.request.urlopen("http://localhost:8000/api/health/")
        health = json.loads(req.read().decode('utf-8'))
        print(f"✅ Django Backend is HEALTHY: {health}")
    except Exception as e:
        print(f"❌ Django Backend health check failed: {e}")

    # 2. Check JWT Endpoint
    try:
        data = json.dumps({"email": "ai_test_student@auca.ac.rw", "password": "testpass123"}).encode('utf-8')
        req = urllib.request.Request("http://localhost:8000/api/token/", data=data, headers={'Content-Type': 'application/json'})
        res = urllib.request.urlopen(req)
        tokens = json.loads(res.read().decode('utf-8'))
        print("✅ JWT Authentication token pair retrieved successfully!")
        
        # 3. Check Profile Endpoint with Auth
        access_token = tokens['access']
        req_profile = urllib.request.Request("http://localhost:8000/api/profiles/me/", headers={'Authorization': f'Bearer {access_token}'})
        res_profile = urllib.request.urlopen(req_profile)
        profile = json.loads(res_profile.read().decode('utf-8'))
        print(f"✅ Live Profile Endpoint works! Logged in as: {profile['full_name']} ({profile['program']})")
        
        # 4. Check Recommendations Endpoint with Auth
        req_recs = urllib.request.Request("http://localhost:8000/api/recommendations/", headers={'Authorization': f'Bearer {access_token}'})
        res_recs = urllib.request.urlopen(req_recs)
        recs = json.loads(res_recs.read().decode('utf-8'))
        print(f"✅ Live AI Recommendations Endpoint works! Found {len(recs)} matches.")
        for r in recs[:2]:
            print(f"   - Match: {r['title']} ({r['match_percentage']}%) | Edu: {r['required_education']} | Exp: {r['work_experience']}")
            
    except Exception as e:
        print(f"❌ API Token Authenticated checks failed: {e}")

    # 5. Check Frontend Port 3000
    try:
        req_fe = urllib.request.urlopen("http://localhost:3000/")
        print(f"✅ React Frontend server is UP on Port 3000! Status: {req_fe.status}")
    except Exception as e:
        print(f"❌ React Frontend check failed: {e}")

if __name__ == '__main__':
    test_connectivity()
