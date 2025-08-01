import React, { useState, useEffect } from 'react'
import '../styles/Login.css'
import { Loader, logo } from '../constant/Util';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAPI, addUpdateAPI } from '../constant/apiServices'; // <-- import both
import Swal from 'sweetalert2';

export default function Recover_password() {
    const navigate = useNavigate();
    const { search } = useLocation();

    const [verifying, setVerifying] = useState(true);
    const [tokenError, setTokenError] = useState('');
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState(false);
    const [viewConfirm, setViewConfirm] = useState(false);

    const token = new URLSearchParams(search).get('token');

    // Your GET-helper
    const gettoekn = () => {
        getAPI(`access/link-expired?token=${token}`)
            .then(res => {
                if (!res.data.status) {
                    setTokenError(res.data.message || "This link is expired or invalid.");
                }
            })
            .catch(() => {
                setTokenError("Unable to verify link. Please try again later.");
            })
            .finally(() => {
                setVerifying(false);
            });
    };

    useEffect(() => {
        if (!token) {
            setTokenError("No reset token provided.");
            setVerifying(false);
        } else {
            gettoekn();
        }
    }, [token]);

    const schema = yup.object().shape({
        password: yup.string()
            .required("Password is required")
            .min(8, "At least 8 characters")
            .test(
                "passwordRequirements",
                "Include lowercase, uppercase, number & symbol.",
                val => !!val && [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].every(rx => rx.test(val))
            ),
        confirmPassword: yup.string()
            .oneOf([yup.ref('password')], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = data => {
        setLoading(true);
        addUpdateAPI('POST', 'access/reset-password', {
            token,
            new_password: data.password,
            confirm_password: data.confirmPassword
        })
            .then(res => {
                if (res.data.status) {
                    Swal.fire(res.data.details).then(() => navigate('/login'));
                } else {
                    setTokenError(res.data.details);
                }
            })
            .catch(() => {
                setTokenError("Failed to reset password. Please try again.");
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="login-background">
            <div className="login-form bg-light p-5 rounded bg-transparent position-absolute animationFadeIn">
                <div className="mb-4 text-center">{logo('black')}</div>

                {verifying && <Loader />}

                {!verifying && tokenError && (
                    <div className="alert alert-danger text-center">
                        {tokenError}

                    </div>
                )}

                {!verifying && !tokenError && (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3 mt-2">
                            <div className="input-group mb-0">
                                <input
                                    type={view ? "text" : "password"}
                                    placeholder="Password"
                                    {...register('password')}
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                />
                                <span className="input-group-text" id="Password" onClick={() => setView(!view)} role="button">
                                    {view ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                            <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                            {errors.password && <span className="text-danger">{errors.password.message}</span>}
                        </div>

                        <div className="mb-3 mt-2">
                            <div className="input-group mb-0">
                                <input
                                    type={viewConfirm ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    {...register('confirmPassword')}
                                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                />
                                <span className="input-group-text" id="Password" onClick={() => setViewConfirm(!viewConfirm)} role="button">
                                    {viewConfirm ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                                            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye-slash" viewBox="0 0 16 16">
                                            <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z" />
                                            <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829" />
                                            <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                            {errors.confirmPassword && <span className="text-danger">{errors.confirmPassword.message}</span>}
                        </div>

                        {loading
                            ? <Loader />
                            : (
                                <div className="text-center">
                                    <button type="submit" className="btn rounded btn-sm adminBtn fw-bold p-2 px-4">
                                        Change password
                                    </button>
                                </div>
                            )}
                    </form>
                )}

                <div className="bottom-content mt-2 text-center">
                    <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}
