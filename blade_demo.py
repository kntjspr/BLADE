import time
import sys
import os
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}=== {text} ==={Colors.ENDC}")

def print_step(text):
    print(f"{Colors.CYAN}[STEP]{Colors.ENDC} {text}")

def print_info(text):
    print(f"{Colors.BLUE}[INFO]{Colors.ENDC} {text}")

def print_success(text):
    print(f"{Colors.GREEN}[SUCCESS]{Colors.ENDC} {text}")

def pause_for_demo(prompt="Press Enter to execute next step..."):
    print(f"\n{Colors.WARNING}>> {prompt}{Colors.ENDC}")
    input()

BASE_URL = "http://localhost:3000"

def run_standard_bot():
    print_header("SCENARIO 1: Standard Automation Bot")
    print_info("This represents a basic scraper attempting to access the site.")
    print_info("It has no stealth measures and announces itself as automated software.")
    
    pause_for_demo("Ready to launch Standard Bot?")

    options = Options()
    
    
    print_step("Initializing Chrome Driver...")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    try:
        print_step(f"Navigating to {BASE_URL}...")
        driver.get(BASE_URL)
        
        print_info("Bot is now on the page. BLADE should detect 'Selenium' or 'Automation'.")
        pause_for_demo("Observe the red 'DETECTED' flags on the dashboard.")
        
    except Exception as e:
        print(f"{Colors.FAIL}Error: {e}{Colors.ENDC}")
    finally:
        print_step("Closing browser...")
        driver.quit()

def run_headless_bot():
    print_header("SCENARIO 2: Headless Scraper")
    print_info("This represents a server-side bot running without a UI.")
    print_info("Common for mass crawling and data harvesting.")
    
    pause_for_demo("Ready to launch Headless Bot?")

    options = Options()
    options.add_argument("--headless=new")
    
    print_step("Initializing Headless Chrome Driver...")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    try:
        print_step(f"Navigating to {BASE_URL}...")
        driver.get(BASE_URL)
        
        
        print_step("Scrolling to bottom to capture detection results...")
        time.sleep(4)

        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        
        print_step("Taking screenshot 'headless_proof.png'...")
        driver.save_screenshot("headless_proof.png")
        print_success("Screenshot saved!")
        
        print_info("Bot is active in background.")
        pause_for_demo("Check BLADE dashboard for 'Headless' detection.")
        
    except Exception as e:
        print(f"{Colors.FAIL}Error: {e}{Colors.ENDC}")
    finally:
        print_step("Closing browser...")
        driver.quit()

def run_stealth_attempt():
    print_header("SCENARIO 3: Stealth/Evasion Attempt")
    print_info("This represents a sophisticated actor trying to hide.")
    
    
    pause_for_demo("Ready to launch Stealth Bot?")

    options = Options()
    
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    print_step("Initializing Stealth Driver (Modified Flags)...")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    # i'm spoofing useragent by directly modifying navigator.webdriver object
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    try:
        print_step(f"Navigating to {BASE_URL}...")
        driver.get(BASE_URL)
        
        print_info("Bot has attempted to mask its identity.")
        print_info("See if BLADE's deep heuristics (Proto, Consistency) still catch it.")
        pause_for_demo("Analyze the results.")

    except Exception as e:
        print(f"{Colors.FAIL}Error: {e}{Colors.ENDC}")
    finally:
        print_step("Closing browser...")
        driver.quit()

def run_playground_attack():
    print_header("SCENARIO 4: Behavioral Analysis (Playground)")
    print_info("Demonstrating superhuman speed filling out forms.")
    
    pause_for_demo("Ready to launch High-Speed Form Bot?")

    options = Options()
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    try:
        print_step(f"Navigating to {BASE_URL}...")
        driver.get(BASE_URL)
        
        # Wait for page to fully load
        time.sleep(3)
        
        print_step("Clicking 'Playground' navigation...")
        
        # Use JavaScript to click the Playground button (more reliable for React apps)
        try:
            driver.find_element(By.XPATH, "//*[@id='root']/div/nav/div/button[2]").click()
            print_success("Clicked Playground navigation via JavaScript")
        except Exception as e:
            print_info(f"JS click issue: {e}, trying Selenium click...")
            # Fallback to Selenium click
            nav_buttons = driver.find_elements(By.TAG_NAME, "button")
            for btn in nav_buttons:
                if "Playground" in btn.text:
                    btn.click()
                    print_success("Clicked via Selenium")
                    break
        
        # Wait for the Playground page to render (form should appear)
        time.sleep(2)
        
        print_step("Waiting for Playground form to load...")
        
        # Wait for the form to be present
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "form"))
            )
            print_success("Form found!")
        except:
            print_info("Form not found with WebDriverWait, checking page state...")
            # Debug: print current page source title
            print_info(f"Page title: {driver.title}")
            raise Exception("Could not find form - might not be on Playground page")
        
        print_step("Locating form fields...")
        
        # Find the form
        form = driver.find_element(By.TAG_NAME, "form")
        
        # Get all inputs - using direct CSS selectors on page (not scoped to form for reliability)
        name_input = driver.find_element(By.CSS_SELECTOR, "input[type='text']")
        email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email']")
        msg_input = driver.find_element(By.TAG_NAME, "textarea")
        
        print_success("Found all form fields: Name, Email, Message")
        
        print_step("Botting the form at superhuman speed...")
        
        # Bot fills form instantly - no delays between fields
        name_input.send_keys("Botty McBotface")
        email_input.send_keys("bot@example.com")
        msg_input.send_keys("I am filling this form faster than any human possibly could.")
        
        print_step("Finding and clicking submit button...")
        
        # Find submit button
        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()
        
        print_success("Form submitted instantly!")
        print_info("Bot filled the entire form in milliseconds - this should trigger behavior detection.")
        
        time.sleep(3)  # Wait for results to load
        
        pause_for_demo("Check the Behavior Metrics on screen. Form Fill Time should be very low (suspicious).")

    except Exception as e:
        print(f"{Colors.FAIL}Error: {e}{Colors.ENDC}")
        import traceback
        traceback.print_exc()
    finally:
        print_step("Closing browser...")
        driver.quit()

def main():
    while True:
        os.system('cls' if os.name == 'nt' else 'clear')
        print(f"{Colors.HEADER}╔════════════════════════════════════════╗{Colors.ENDC}")
        print(f"{Colors.HEADER}║      BLADE DEMONSTRATION  SCRIPT       ║{Colors.ENDC}")
        print(f"{Colors.HEADER}╚════════════════════════════════════════╝{Colors.ENDC}")
        print("1. Standard Bot (Basic Selenium)")
        print("2. Headless Bot (Server-side Scraper)")
        print("3. Stealth Attempt (Evasion Techniques)")
        print("4. Behavioral Speed Test (Playground)")
        print("Q. Quit")
        
        choice = input(f"\n{Colors.BOLD}Select Scenario > {Colors.ENDC}").lower()
        
        if choice == '1':
            run_standard_bot()
        elif choice == '2':
            run_headless_bot()
        elif choice == '3':
            run_stealth_attempt()
        elif choice == '4':
            run_playground_attack()
        elif choice == 'q':
            sys.exit()
        
if __name__ == "__main__":
    main()
