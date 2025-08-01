import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import { BrowserRouter } from 'react-router-dom';
import * as apiServices from '../constant/apiServices';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';  // Ensure vi is imported for mocking



// Mock the API function using vi.mock
vi.mock('../constant/apiServices', () => ({
    addUpdateAPI: vi.fn(),
}));

// Mock useNavigate from react-router-dom
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedUsedNavigate,
    };
});

// Helper to render the Login component wrapped with BrowserRouter
const renderLogin = () => {
    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
};

describe('Login Page', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    test('renders login form', () => {
        renderLogin();
        expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('shows validation errors when fields are empty', async () => {
        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        // Check for validation error messages
        expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
        expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });

    test('calls API and navigates on successful login', async () => {
        apiServices.addUpdateAPI.mockResolvedValueOnce({
            data: {
                status: true,
                access_token: 'mock_token',
                user: { id: 'mock_user_id' }
            }
        });

        renderLogin();
        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'admin123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(apiServices.addUpdateAPI).toHaveBeenCalledWith('POST', 'access/login', expect.any(FormData));
            expect(sessionStorage.getItem('token')).toBe('mock_token');
            expect(sessionStorage.getItem('userId')).toBe('mock_user_id');
            expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    test('shows error message on failed login', async () => {
        apiServices.addUpdateAPI.mockResolvedValueOnce({
            data: {
                status: false,
                details: 'Invalid credentials'
            }
        });

        renderLogin();
        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'wrong' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // test('displays loader while logging in', async () => {
    //     let resolvePromise;
    //     const pendingPromise = new Promise((res) => { resolvePromise = res; });
    //     apiServices.addUpdateAPI.mockReturnValueOnce(pendingPromise);

    //     renderLogin();
    //     fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
    //     fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'admin123' } });
    //     fireEvent.click(screen.getByRole('button', { name: /login/i }));

    //     expect(screen.getByRole('status')).toBeInTheDocument(); // Loader should contain "loading" text or modify according to your actual loader

    //     resolvePromise({
    //         data: {
    //             status: true,
    //             access_token: 'mock_token',
    //             user: { id: 'mock_user_id' }
    //         }
    //     });

    //     await waitFor(() => {
    //         expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
    //     });
    // });
    test('displays loader while logging in', async () => {
        let resolvePromise;
        const pendingPromise = new Promise((res) => {
            resolvePromise = res;
        });

        apiServices.addUpdateAPI.mockReturnValueOnce(pendingPromise);

        renderLogin();

        fireEvent.change(screen.getByPlaceholderText(/username/i), { target: { value: 'admin' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'admin123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        // ✅ Wait for loader to appear
        expect(await screen.findByRole('status')).toBeInTheDocument();

        resolvePromise({
            data: {
                status: true,
                access_token: 'mock_token',
                user: { id: 'mock_user_id' },
            },
        });

        await waitFor(() => {
            expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
        });

        // ✅ Optionally: wait for loader to disappear
        await waitFor(() => {
            expect(screen.queryByRole('status')).toBeNull();
        });
    });


    test('toggles password visibility', () => {
        renderLogin();
        const passwordInput = screen.getByPlaceholderText(/password/i);
        //   const toggleIcon = screen.getByLabelText('toggle password visibility');
        const toggleIcon = screen.getByLabelText('toggle password visibility');
        expect(toggleIcon).toBeInTheDocument();
        expect(passwordInput).toHaveAttribute('type', 'password');
        fireEvent.click(toggleIcon);
        expect(passwordInput).toHaveAttribute('type', 'text');
    });

});
