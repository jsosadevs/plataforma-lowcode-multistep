import re
from playwright.sync_api import sync_playwright, Page, expect

def run_test(page: Page):
    """
    This test verifies that the FlowRunnerModal opens when a user
    clicks the 'Run Flow' button on the 'Manual Flows' tab.
    """
    # 1. Arrange: Go to the application's homepage.
    page.goto("http://localhost:3000")

    # 2. Arrange: Wait for the main heading to be visible to ensure the page is loaded.
    main_heading = page.get_by_role("heading", name="Responsive Low-Code Flow Platform")
    expect(main_heading).to_be_visible(timeout=10000)

    # 3. Act: Navigate to the "Manual Flows" tab.
    manual_flows_tab = page.get_by_role("tab", name="Manual Flows")
    expect(manual_flows_tab).to_be_visible()
    manual_flows_tab.click()

    # 4. Act: Find the specific "User Onboarding" card and then the button within it.
    # This is a more robust locator strategy.
    user_onboarding_card = page.locator("div.card").filter(has=page.get_by_role("heading", name="User Onboarding"))
    run_flow_button = user_onboarding_card.get_by_role("button", name="Run Flow")
    expect(run_flow_button).to_be_visible()
    run_flow_button.click()

    # 5. Assert: Check that the flow runner modal is now visible.
    modal = page.get_by_role("dialog")
    expect(modal).to_be_visible()
    # The heading contains the name of the first step, "Personal Information".
    expect(modal.get_by_role("heading", name="Personal Information")).to_be_visible()

    # 6. Screenshot: Capture the state with the modal open for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

    # 7. Act: Find and click the close button.
    close_button = page.get_by_tooltip("Close Flow")
    expect(close_button).to_be_visible()
    close_button.click()

    # 8. Assert: Ensure the modal is no longer visible after closing.
    expect(modal).not_to_be_visible()

# --- Playwright Boilerplate ---
def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_test(page)
        browser.close()

if __name__ == "__main__":
    main()