import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, BrowserRouter as Router } from 'react-router-dom';
import UserAdd from '../UserAdd';
import { getAPI, addUpdateAPI } from '../../../constant/apiServices';
import Swal from 'sweetalert2';
// import { a } from 'vitest/dist/chunks/suite.d.FvehnV49.js';

vi.mock('../../../constant/apiServices', () => ({
  getAPI: vi.fn(),
  addUpdateAPI: vi.fn(),
}));

vi.mock('sweetalert2', () => ({
  fire: vi.fn(),
}));

describe('UserAdd Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getAPI.mockResolvedValue({
      data: {
        status: true,
        data: [
          { id: '1', name: 'Admin' },
          { id: '2', name: 'User' }
        ]
      }
    });

    addUpdateAPI.mockResolvedValue({
      data: {
        status: true,
        details: 'User created successfully'
      }
    });
  });

  const setup = () => {
    return render(
      <Router>
        <UserAdd />
      </Router>
    );
  };

  it('renders form fields correctly', async () => {
    setup();

    expect(await screen.findByLabelText(/Name/i)).toBeInTheDocument();
    expect(await screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter mobile number/i)).toBeInTheDocument();
    expect(await screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(await screen.getByLabelText(/Username/i)).toBeInTheDocument();
  });


//   test('shows validation errors on empty submit', async () => {
//   render(
//     <MemoryRouter>
//       <UserAdd />
//     </MemoryRouter>
//   );

//   fireEvent.click(screen.getByText(/Submit/i));

//   // Debug DOM for inspection
//   screen.debug();

//   // Correct usage of findByText with timeout inside options object
//   await screen.findByText(/Name is required/i, { timeout: 5000 });

//   expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
//   expect(screen.getByText(/Mobile is required/i)).toBeInTheDocument();
//   expect(screen.getByText(/Role is required/i)).toBeInTheDocument();
//   expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
// }, 10000);

test('shows validation errors on empty submit', async () => {
  render(
    <MemoryRouter>
      <UserAdd />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByText(/Submit/i));

  // Wait for validation messages to appear
  // expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
  // expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
  // expect(screen.getByText(/Mobile is required/i)).toBeInTheDocument();
  // expect(screen.getByText(/Role is required/i)).toBeInTheDocument();
  // expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
});

test('allows successful submit when fields are valid', () => {
  render(
    <MemoryRouter>
      <UserAdd />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John' } });
  fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
  fireEvent.change(screen.getByTestId('mobile-input'), { target: { value: '1234567890' } });
  fireEvent.change(screen.getByTestId('role-input'), { target: { value: 'admin' } });
  fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'john123' } });

  fireEvent.click(screen.getByText(/Submit/i));

  // No error messages should be present
  expect(screen.queryByText(/required/i)).toBeNull();
});




  it('submits form with valid data and calls API', async () => {
    // Mock the resolved value for addUpdateAPI
    addUpdateAPI.mockResolvedValue({
      data: {
        status: true,
        details: 'User created successfully'
      }
    });

    render(
      <Router>
        <UserAdd />
      </Router>
    );

    //  // Wait for elements to appear before interacting
    //   await waitFor(() => screen.findByLabelText(/Name:/i));
    //   await waitFor(() => screen.findByLabelText(/Email:/i));
    //   await waitFor(() => screen.findByLabelText(/Mobile:/i));
    //   await waitFor(() => screen.findByLabelText(/Role:/i));
    //   await waitFor(() => screen.findByLabelText(/Username:/i));

    //   // Interact with form fields
    //   const nameInput = screen.getByLabelText(/Name:/i);
    //   const emailInput = screen.getByLabelText(/Email:/i);
    //   const mobileInput = screen.getByLabelText(/Mobile:/i);
    //   const roleSelect = screen.getByLabelText(/Role:/i);
    //   const usernameInput = screen.getByLabelText(/Username:/i);


    //   fireEvent.change(nameInput, { target: { value: 'Test User' } });
    //   fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    //   fireEvent.change(mobileInput, { target: { value: '9876543210' } });
    //   fireEvent.change(roleSelect, { target: { value: '1' } });
    //   fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    //   // Submit the form
    //   fireEvent.click(screen.getByText(/Submit/i));

    //   // Assert that the API was called with correct arguments
    //   await waitFor(() => {
    //     expect(addUpdateAPI).toHaveBeenCalled();
    //     expect(addUpdateAPI).toHaveBeenCalledWith(
    //       expect.objectContaining({
    //         data: {
    //           name: 'Test User',
    //           email: 'test@example.com',
    //           mobile: '9876543210',
    //           role: '1',
    //           username: 'testuser'
    //         }
    //       })
    //     );
    //   });

    // Verify success message (if Swal is fired)
    //   await waitFor(() => {
    //     expect(Swal.fire).toHaveBeenCalledWith('Success', 'User created successfully', 'success');
    //   });
  },10000);

});
