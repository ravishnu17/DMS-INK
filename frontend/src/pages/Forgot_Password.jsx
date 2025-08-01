import React, { useState } from 'react'
import '../styles/Login.css'
import { Loader, logo } from '../constant/Util';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Link, useNavigate } from 'react-router-dom';
import { addUpdateAPI } from '../constant/apiServices';
import Swal from 'sweetalert2';

function Forgot_Password() {
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false);

    // Define validation schema
    const schema = yup.object().shape({
        email: yup.string()
        .required('Email is required')
        .email('Email is invalid'),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = (data) => {
        setLoading(true);
        let apiData =  {
            "email": data?.email,
          }

        addUpdateAPI('POST', 'access/forgot-password', apiData).then((res) => {                                    
            if (res?.data?.status) {
                Swal.fire(res?.data?.details)
                navigate("/login");
            } else {
                setErrorMsg(res?.data?.details);
                setLoading(false);
            }
        }).catch((err) => {
            console.log(err);
            setLoading(false);
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
                                type="email"
                                placeholder='Email'
                                {...register('email')}
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            />
                            <span className="input-group-text" id="email">
                                <span className="fas fa-envelope" />
                            </span>
                        </div>
                        {errors?.email && <span className="text-danger">{errors?.email?.message}</span>}
                    </div>
                    

                    {
                        loading ?
                            <Loader />
                            :
                            <div className="text-center">
                                <button type="submit" className="btn rounded btn-sm ms-3 adminBtn fw-bold p-2 px-4" title="Request new password" >Request new password</button>
                            </div>
                    }

                </form>
                <div className="bottom-content mt-2">
                        <p className="">
                            <Link to="/login" title='Login' className="text-center pointer">
                                Login
                            </Link>
                        </p>
                    </div>
            </div>

        </div>
    )
}

export default Forgot_Password