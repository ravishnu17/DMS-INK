# Running Test Cases in the `testcase` Directory

This guide provides instructions on how to run the test cases available in the `testcase` directory of the project.

## Prerequisites

1. **Python Environment**: Ensure you have Python 3.8+ installed.
2. **Dependencies**: Install the required dependencies by running:
    ```bash
    pip install -r requirements.txt
    ```
3. **Database Setup**: Ensure the database is properly configured and running. Update the `.env` file with the correct database credentials.

## Running the Tests

1. **Navigate to the Project Directory**:
    ```bash
    cd /e:/BOSCO/ProjectDMS/DMS-DDM/backend
    ```

2. **Activate the Virtual Environment**:
    On Windows:
    ```bash
    .\env\Scripts\activate
    ```
    On macOS/Linux:
    ```bash
    source env/bin/activate
    ```

3. **Run All Tests**:
    ```bash
    pytest testcase/
    ```
    Use `pytest` to execute all test cases in the `testcase` directory:
    ```bash
    pytest testcase/
    ```

4. **Run a Specific Test File**:
    To run a specific test file, provide the file path:
    ```bash
    pytest testcase/test_category.py
    ```

5. **Run a Specific Test Function**:
    To run a specific test function, use the `::` syntax:
    ```bash
    pytest testcase/test_category.py::test_get_category
    ```
6. **View Detailed Output**:
    To see detailed output, use the `-v` flag for verbose mode:
    ```bash
    pytest -v testcase/
    ```
    For both verbose output and to display print statements during test execution, add the `-s` flag:
    ```bash
    pytest -s -v testcase/
        ```

7. **Generate Test Coverage Report**:
    Install `pytest-cov` if not already installed:
    ```bash
    pip install pytest-cov
    ```
    Run tests with coverage:
    ```bash
    pytest --cov=backend testcase/
    ```

## Debugging Tests

- Use `print` statements or logging within test functions to debug.
- For database-related tests, ensure the test database is seeded with the required data.

## Notes

- Ensure the `auth_headers` and other required fixtures are properly configured for authentication-based tests.
- Use the `check_all_required_data` utility in the test files to verify that all required model records are present in the database.

For further assistance, refer to the project documentation or contact the development team.  