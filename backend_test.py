#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Blog Platform
Tests all endpoints with proper authentication and error handling
"""

import requests
import sys
import json
import base64
from datetime import datetime
from typing import Dict, Any, Optional

class BlogAPITester:
    def __init__(self, base_url="https://blog-platform-26.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_blog_id = None
        self.test_blog_slug = None

    def log(self, message: str, test_type: str = "INFO"):
        """Log test results with formatting"""
        prefix = "✅" if test_type == "PASS" else "❌" if test_type == "FAIL" else "🔍"
        print(f"{prefix} {message}")

    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                data: Optional[Dict] = None, headers: Optional[Dict] = None, 
                params: Optional[Dict] = None) -> tuple[bool, Dict]:
        """Run a single API test with comprehensive error handling"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        
        self.tests_run += 1
        self.log(f"Testing {name}... ({method} {endpoint})", "INFO")
        
        try:
            response = None
            if method == 'GET':
                response = requests.get(url, headers=test_headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            response_data = {}
            
            try:
                if response.content:
                    response_data = response.json()
            except json.JSONDecodeError:
                response_data = {"raw_response": response.text}

            if success:
                self.tests_passed += 1
                self.log(f"PASSED - Status: {response.status_code}", "PASS")
                if response_data and isinstance(response_data, dict):
                    for key, value in response_data.items():
                        if key not in ['content', 'image_data'] and len(str(value)) < 100:
                            print(f"  → {key}: {value}")
            else:
                self.log(f"FAILED - Expected {expected_status}, got {response.status_code}", "FAIL")
                if response_data:
                    self.log(f"Response: {response_data}", "FAIL")

            return success, response_data

        except requests.exceptions.RequestException as e:
            self.log(f"FAILED - Network Error: {str(e)}", "FAIL")
            return False, {}
        except Exception as e:
            self.log(f"FAILED - Unexpected Error: {str(e)}", "FAIL")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_admin_login_success(self):
        """Test admin login with correct password"""
        success, response = self.run_test(
            "Admin Login (Correct Password)",
            "POST",
            "admin/login",
            200,
            data={"password": "admin123"}
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.log(f"Admin token obtained: {self.admin_token[:10]}...", "PASS")
        return success

    def test_admin_login_failure(self):
        """Test admin login with wrong password"""
        return self.run_test(
            "Admin Login (Wrong Password)",
            "POST",
            "admin/login",
            401,
            data={"password": "wrongpassword"}
        )

    def test_get_categories(self):
        """Test getting blog categories"""
        return self.run_test("Get Categories", "GET", "categories", 200)

    def test_get_public_blogs(self):
        """Test getting public blog list"""
        return self.run_test("Get Public Blogs", "GET", "blogs", 200)

    def test_search_blogs(self):
        """Test blog search functionality"""
        return self.run_test(
            "Search Blogs", 
            "GET", 
            "blogs", 
            200,
            params={"search": "test"}
        )

    def test_filter_blogs_by_category(self):
        """Test filtering blogs by category"""
        return self.run_test(
            "Filter Blogs by Category",
            "GET",
            "blogs",
            200,
            params={"category": "Technology"}
        )

    def test_admin_get_blogs_unauthorized(self):
        """Test admin blog list without authentication"""
        return self.run_test("Admin Get Blogs (No Auth)", "GET", "admin/blogs", 401)

    def test_admin_get_blogs_authorized(self):
        """Test admin blog list with authentication"""
        if not self.admin_token:
            self.log("Skipping admin blogs test - no admin token", "FAIL")
            return False, {}
            
        return self.run_test(
            "Admin Get Blogs (Authorized)",
            "GET",
            "admin/blogs",
            200,
            headers={"x-admin-token": self.admin_token}
        )

    def test_create_blog(self):
        """Test creating a new blog post"""
        if not self.admin_token:
            self.log("Skipping blog creation - no admin token", "FAIL")
            return False, {}

        # Create a simple base64 encoded test image (1x1 pixel PNG)
        test_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        blog_data = {
            "title": f"Test Blog Post {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "content": "<p>This is a test blog post content with <strong>HTML formatting</strong>.</p>",
            "excerpt": "Test blog post excerpt",
            "category": "Technology", 
            "published": True,
            "image_data": f"data:image/png;base64,{test_image_b64}"
        }

        success, response = self.run_test(
            "Create Blog Post",
            "POST",
            "admin/blogs",
            200,
            data=blog_data,
            headers={"x-admin-token": self.admin_token}
        )

        if success and 'id' in response:
            self.test_blog_id = response['id']
            self.test_blog_slug = response.get('slug')
            self.log(f"Blog created with ID: {self.test_blog_id}", "PASS")
        
        return success

    def test_get_blog_detail(self):
        """Test getting blog detail by slug"""
        if not self.test_blog_slug:
            self.log("Skipping blog detail test - no test blog slug", "FAIL")
            return False, {}
            
        return self.run_test(
            "Get Blog Detail",
            "GET", 
            f"blogs/{self.test_blog_slug}",
            200
        )

    def test_get_blog_image(self):
        """Test getting blog image"""
        if not self.test_blog_slug:
            self.log("Skipping blog image test - no test blog slug", "FAIL")
            return False, {}
            
        # This should return image binary data, so we test differently
        url = f"{self.api_url}/blogs/{self.test_blog_slug}/image"
        self.tests_run += 1
        self.log(f"Testing Get Blog Image... (GET blogs/{self.test_blog_slug}/image)", "INFO")
        
        try:
            response = requests.get(url, timeout=10)
            success = response.status_code == 200 and response.headers.get('content-type', '').startswith('image/')
            
            if success:
                self.tests_passed += 1
                self.log(f"PASSED - Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}", "PASS")
            else:
                self.log(f"FAILED - Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}", "FAIL")
            
            return success, {}
        except Exception as e:
            self.log(f"FAILED - Error: {str(e)}", "FAIL")
            return False, {}

    def test_update_blog(self):
        """Test updating the blog post"""
        if not self.admin_token or not self.test_blog_id:
            self.log("Skipping blog update - no admin token or blog ID", "FAIL")
            return False, {}

        update_data = {
            "title": f"Updated Test Blog Post {datetime.now().strftime('%H%M%S')}",
            "excerpt": "Updated test blog post excerpt",
            "category": "Design"
        }

        return self.run_test(
            "Update Blog Post",
            "PUT",
            f"admin/blogs/{self.test_blog_id}",
            200,
            data=update_data,
            headers={"x-admin-token": self.admin_token}
        )

    def test_get_admin_blog_detail(self):
        """Test getting admin blog detail"""
        if not self.admin_token or not self.test_blog_id:
            self.log("Skipping admin blog detail - no admin token or blog ID", "FAIL")
            return False, {}
            
        return self.run_test(
            "Get Admin Blog Detail",
            "GET",
            f"admin/blogs/{self.test_blog_id}",
            200,
            headers={"x-admin-token": self.admin_token}
        )

    def test_delete_blog(self):
        """Test deleting the blog post"""
        if not self.admin_token or not self.test_blog_id:
            self.log("Skipping blog deletion - no admin token or blog ID", "FAIL")
            return False, {}

        return self.run_test(
            "Delete Blog Post",
            "DELETE",
            f"admin/blogs/{self.test_blog_id}",
            200,
            headers={"x-admin-token": self.admin_token}
        )

    def test_get_deleted_blog(self):
        """Test that deleted blog returns 404"""
        if not self.test_blog_slug:
            self.log("Skipping deleted blog test - no test blog slug", "FAIL")
            return False, {}
            
        return self.run_test(
            "Get Deleted Blog (Should Fail)",
            "GET",
            f"blogs/{self.test_blog_slug}",
            404
        )

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Blog Platform API Tests")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

        # Test sequence
        tests = [
            self.test_api_root,
            self.test_admin_login_failure,
            self.test_admin_login_success,
            self.test_get_categories,
            self.test_get_public_blogs,
            self.test_search_blogs,
            self.test_filter_blogs_by_category,
            self.test_admin_get_blogs_unauthorized,
            self.test_admin_get_blogs_authorized,
            self.test_create_blog,
            self.test_get_blog_detail,
            self.test_get_blog_image,
            self.test_get_admin_blog_detail,
            self.test_update_blog,
            self.test_delete_blog,
            self.test_get_deleted_blog
        ]

        for test in tests:
            try:
                test()
                print()  # Add spacing between tests
            except Exception as e:
                self.log(f"Test {test.__name__} failed with error: {str(e)}", "FAIL")
                print()

        # Print final results
        print("=" * 60)
        print(f"📊 FINAL RESULTS:")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_run - self.tests_passed}")
        print(f"🎯 Total: {self.tests_run}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = BlogAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Critical error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())