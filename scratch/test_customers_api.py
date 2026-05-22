import urllib.request
import urllib.parse
import urllib.error
import json

base_url = "http://localhost:8080"

def test_api():
    try:
        # 1. Login
        login_url = f"{base_url}/api/auth/login"
        login_data = json.dumps({
            "username": "admin",
            "password": "admin123"
        }).encode('utf-8')
        
        req = urllib.request.Request(
            login_url, 
            data=login_data, 
            headers={"Content-Type": "application/json"}
        )
        
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            token = res_body.get("data", {}).get("accessToken") if res_body.get("data") else None
            if not token:
                print("No token returned")
                return

        # 2. Get all customers with no search query
        print("\n--- Getting all customers ---")
        customers_url = f"{base_url}/api/customers"
        req = urllib.request.Request(
            customers_url,
            headers={"Authorization": f"Bearer {token}"}
        )
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            customers = res_body.get("data", [])
            print(f"Total customers returned: {len(customers)}")
            for c in customers:
                print(f"- {c.get('maKhachHang')}: {ascii(c.get('tenKhachHang'))} ({c.get('soDienThoaiKhachHang')})")

        # 3. Search with q=09022
        print("\n--- Searching for q=09022 ---")
        search_url = f"{base_url}/api/customers?q=09022"
        req = urllib.request.Request(
            search_url,
            headers={"Authorization": f"Bearer {token}"}
        )
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            results = res_body.get("data", [])
            print(f"Total search results for '09022': {len(results)}")
            for c in results:
                print(f"- {c.get('maKhachHang')}: {ascii(c.get('tenKhachHang'))} ({c.get('soDienThoaiKhachHang')})")

        # 4. Search with q=Minh
        print("\n--- Searching for q=Minh ---")
        search_url = f"{base_url}/api/customers?q=Minh"
        req = urllib.request.Request(
            search_url,
            headers={"Authorization": f"Bearer {token}"}
        )
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            results = res_body.get("data", [])
            print(f"Total search results for 'Minh': {len(results)}")
            for c in results:
                print(f"- {c.get('maKhachHang')}: {ascii(c.get('tenKhachHang'))} ({c.get('soDienThoaiKhachHang')})")

        # 5. Search with q=0902222333
        print("\n--- Searching for q=0902222333 ---")
        search_url = f"{base_url}/api/customers?q=0902222333"
        req = urllib.request.Request(
            search_url,
            headers={"Authorization": f"Bearer {token}"}
        )
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            results = res_body.get("data", [])
            print(f"Total search results for '0902222333': {len(results)}")
            for c in results:
                print(f"- {c.get('maKhachHang')}: {ascii(c.get('tenKhachHang'))} ({c.get('soDienThoaiKhachHang')})")

    except urllib.error.HTTPError as e:
        import traceback
        traceback.print_exc()
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_api()
