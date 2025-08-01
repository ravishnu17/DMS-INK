import React, { useState } from 'react'
import '../styles/Login.css'
import { Loader, logo } from '../constant/Util';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Link, useNavigate } from 'react-router-dom';
import { addUpdateAPI } from '../constant/apiServices';

function Login() {
    const navigate = useNavigate();
    const [view, setView] = useState(false);
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false);

    // Define validation schema
    const schema = yup.object().shape({
        username: yup.string().required("Username is required"),
        password: yup.string().required("Password is required"),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });


    const onSubmit = (data) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('username', data?.username.trim());
        formData.append('password', data?.password.trim());
        addUpdateAPI('POST', 'access/login', formData).then((res) => {
            // console.log("login ", res);

            if (res?.data?.status) {
                // console.log("Login Token", res?.data?.access_token);

                sessionStorage.setItem('token', res?.data?.access_token);
                sessionStorage.setItem('userId', res?.data?.user?.id);
                navigate("/dashboard");
            } else {
                setErrorMsg(res?.data?.details);
            }
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            setLoading(false);
        })
    };

    return (
        <div className="login-background">
            <div className="login-form bg-light p-5 rounded bg-transparent position-absolute animationFadeIn">
                <div className='mb-4'><p className='text-danger text-center mt-0'>{errorMsg}</p> {logo('black')}</div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='mb-3 mt-2'>
                        <div className="input-group mb-0">
                            <input
                                type="text"
                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                placeholder='Email Id'
                                aria-label="Username"
                                aria-describedby="Username"
                                {...register("username")}

                            />
                            <span className="input-group-text" id="Username">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
                                </svg>
                            </span>


                        </div>
                        {errors.username && <span className="text-danger">{errors.username.message}</span>}

                    </div>
                    <div className='mb-3'>
                        <div className="input-group mb-0">
                            <input
                                type={view ? "text" : "password"}
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                autoComplete='new-password'
                                placeholder='Password'
                                aria-label="Password"
                                aria-describedby="Password"
                                {...register("password")}

                            />
                            <span className="input-group-text" id="Password" onClick={() => setView(!view)} role="button" aria-label="toggle password visibility">
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
                    {
                        loading ?
                            <div >
                                <Loader />
                            </div>

                            :
                            <div className="text-center">
                                <button type="submit"  disabled={loading} className="btn rounded btn-sm ms-3 adminBtn fw-bold p-2 px-4" title="Login" >LOGIN</button>
                            </div>
                    }
                  
                    
                </form>
                <div className="d-flex justify-content-end mt-2">
                    <p className="mb-1">
                        <Link to="/forgot-password" className="text-center pointer">
                            Forgot password
                        </Link>
                    </p>
                </div>
            </div>

        </div>
    )
}

export default Login