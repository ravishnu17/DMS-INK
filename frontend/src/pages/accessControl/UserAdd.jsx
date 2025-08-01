import React, { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLocation, useNavigate } from 'react-router-dom';
import { addUpdateAPI, getAPI } from '../../constant/apiServices';
import Swal from 'sweetalert2';
import PhoneInput from 'react-phone-input-2';
import { isValidPhoneNumber } from 'libphonenumber-js';
import 'react-phone-input-2/lib/style.css';
import { Loader } from '../../constant/Util';

// Validation Schema
const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    mobile_no: yup
        .string()
        .matches(/^\d{10}$/, "Mobile number must be 10 digits")
        .required("Mobile number is required"),
    role_id: yup.string().required("Role is required"),
    // username: yup.string().required("Username is required"),

    // community_ids:yup.string().required("Community is required"),
    // community_ids: yup.array().min(1, "Select at least one community").required("Community is required"),
    // society_ids: yup.array().min(1, "Select at least one Socity").required("Socity is required"),
    // portfolio_ids: yup.array().min(1, "Select at least one Portfolios").required("Portfolios is required"),
    // legal_entity_ids: yup.array().min(1, "Select at least one RealEnitity").required("RealEnitity is required")
    // community_list: yup.array().min(1, "Select at least one community"),
});


function UserAdd() {
    const location = useLocation();
    const action = location.state?.action;
    const userData = location.state?.userData;

    const [loading, setLoading] = useState(false);  // New loading state
    const [phone, setPhone] = useState({ country_code: '91', mobile_no: '' });

    const navigate = useNavigate();
    const { register, handleSubmit, reset, formState: { errors }, setValue, control } = useForm({ resolver: yupResolver(schema) });
    const [roleList, setRoleList] = useState([]);

    const getRoleList = () => {
        getAPI('/access/roles?skip=0&limit=25').then((res) => {
            if (res?.data?.status) {
                setRoleList(res.data.data);
                setTimeout(() => {
                    userData?.role_id && setValue("role_id", userData?.role_id);
                }, 50)
            } else {
                setRoleList([]);
            }
        }).catch((err) => {
            // console.log(err);
        })
    }

    const onSubmit = (data) => {
        setLoading(true);
        data.password = "admin";
        data.username = data.email;
        const url = action == "Add" ? "/access/users" : action == "Update" && "/access/users/" + userData?.id;
        const mapping = action == "Add" ? "POST" : action == "Update" && "PUT";
        console.log(data,"data");
        
        addUpdateAPI(mapping, url, data).then((res) => {
            if (res?.data?.status) {
                reset();
                //success
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Success',
                    text: res?.data?.details || 'Success',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: ' #28a745',
                    color: '  #ffff'
                });
                navigate('/accessControl/userList');
                setLoading(false);
            } else {
                Swal.fire({
                    icon: "warning",
                    title: 'Something went wrong!',
                    text: res?.data?.details || 'Something went wrong!',
                    confirmButtonText: 'OK',
                    background: 'rgb(255, 255, 255)',
                    color: '  #000000'
                });
            }
            setLoading(false);
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            setLoading(false);
        })

    };

    const handleBackClick = () => {
        navigate(-1);  // Go back to the previous page
    };

    const handlePhoneChange = (phone, country) => {
        let number = phone?.slice(country?.dialCode?.length)
        var isValidNumber = null
        if (number?.split('')?.every((item) => item === "0")) {
            isValidNumber = false
        } else if (number?.split('')?.[0] === "0") {
            isValidNumber = false
        } else {
            isValidNumber = isValidPhoneNumber(phone, country?.countryCode?.toUpperCase());
        }
        setPhone({ mobile_no: number, country_code: country?.dialCode, error: isValidNumber ? "" : "Enter a valid number" });
        setValue('country_code', country?.dialCode)
        setValue('mobile_no', number, { shouldValidate: true });
    }

    useEffect(() => {
        getRoleList();
    }, [])

    useEffect(() => {
        if (userData) {
            setPhone({ country_code: userData?.mobile_country_code, mobile_no: userData.mobile_no });
            reset({
                "email": userData?.email,
                "country_code": userData?.country_code,
                "mobile_no": userData?.mobile_no,
                "name": userData?.name,
                "username": userData?.username
            })
        }
    }, [userData])

    return (
        <div className="container mt-5">
            <div className="card p-4 pt-2 shadow border-0">
                <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
                    <button className='btn' type='button' onClick={handleBackClick}>
                        <i className='fa-solid fa-circle-left fs-5' />
                    </button>
                    <h6 className="fw-bold text-dark mb-0">{action} User</h6>
                    <div />
                </div>
                {/* <form role='form'  onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Name <span className='text-danger'>*</span></label>
                            <input
                                type="text"
                                {...register("name")}
                                className={`form-control`}
                                placeholder="Enter name"
                            />
                            <div className="text-danger small mt-1">{errors.name?.message}</div>
                        </div>


                        <div className="col-md-4 mb-3">
                            <label className="form-label">Email <span className='text-danger'>*</span></label>
                            <input
                                type="email"
                                {...register("email")}
                                className={`form-control`}
                                placeholder="Enter email"
                            />
                            <div className="text-danger small mt-1">{errors.email?.message}</div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">Mobile <span className='text-danger'>*</span></label>
                            <Controller
                                name="mobile_no"
                                control={control}
                                rules={{
                                    required: 'Mobile is required',
                                }}
                                render={(field) => (
                                    <PhoneInput
                                        {...field}
                                        country={'in'}
                                        value={`${phone?.country_code ? phone?.country_code : ''}${phone?.mobile_no ? phone?.mobile_no : ''}`}
                                        enableSearch={true}
                                        placeholder='Enter mobile number'
                                        inputStyle={{ width: '100%', height: '30px' }}
                                        dropdownStyle={{ color: "black" }}
                                        onChange={(phone, country) => {
                                            handlePhoneChange(phone, country);
                                        }}
                                    />
                                )}
                            />

                            <div className="text-danger small mt-1">{errors.mobile_no?.message}</div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">Role <span className='text-danger'>*</span></label>
                            <select className={`form-select`}   {...register("role_id")} >
                                <option value="">Select role</option>
                                {
                                    roleList.length > 0 && roleList.map((item) => (
                                        <option key={item?.id} value={item?.id}>{item?.name}</option>
                                    ))
                                }
                            </select>
                            <div className="text-danger small mt-1">{errors.role_id?.message}</div>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">Username <span className='text-danger'>*</span></label>
                            <input
                                type="text"
                                {...register("username")}
                                className={`form-control`}
                                placeholder="Enter username"
                            />
                            <div className="text-danger small mt-1">{errors.username?.message}</div>
                        </div>
                    </div>

                    <div className="text-center">
                        <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
                    </div>
                </form> */}
                <form role="form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        {/* Name Field */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="Name" className="form-label">
                                Name <span className="text-danger">*</span>
                            </label>
                            {/* <input
                                id="name"
                                type="text"
                                {...register("name", { required: "Name is required" })}
                                className="form-control"
                                placeholder="Enter name"
                            /> */}
                            <input
                                id="name"
                                type="text"
                                {...register("name", { required: "Name is required" })}
                                className="form-control"
                                placeholder="Enter name"
                                data-testid="name-input"   // <-- add this
                            />
                            <div className="text-danger small mt-1">{errors.name?.message}</div>
                        </div>


                        {/* Email Field */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="email" className="form-label">
                                Email <span className="text-danger">*</span>
                            </label>
                            {/* <input
                                id="email"
                                type="email"
                                {...register("email", { required: "Email is required" })}
                                className="form-control"
                                placeholder="Enter email"
                            /> */}
                            <input
                                id="email"
                                type="email"
                                {...register("email", { required: "Email is required" })}
                                className="form-control"
                                placeholder="Enter email"
                                data-testid="email-input"  // <-- add this
                            />

                            <div className="text-danger small mt-1">{errors.email?.message}</div>
                        </div>

                        {/* Mobile Field using Controller */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="Mobile" className="form-label">
                                Mobile <span className="text-danger">*</span>
                            </label>
                            {/* <Controller
                                name="mobile_no"
                                control={control}
                                rules={{ required: "Mobile is required" }}
                                render={({ field }) => (
                                    <PhoneInput
                                        id="mobile_no"
                                        {...field}
                                        country="in"
                                        value={
                                            `${phone?.country_code || ""}${phone?.mobile_no || ""}`
                                        }
                                        enableSearch
                                        placeholder="Enter mobile number"
                                        inputStyle={{ width: "100%", height: "30px" }}
                                        dropdownStyle={{ color: "black" }}
                                        onChange={(value, country) => handlePhoneChange(value, country)}
                                    />
                                )}
                            /> */}
                            <Controller
                                name="mobile_no"
                                control={control}
                                rules={{ required: "Mobile is required" }}
                                render={({ field }) => (
                                    <PhoneInput
                                        id="mobile_no"
                                        {...field}
                                        country="in"
                                        value={`${phone?.country_code || ""}${phone?.mobile_no || ""}`}
                                        enableSearch
                                        placeholder="Enter mobile number"
                                        inputStyle={{ width: "100%", height: "30px" }}
                                        dropdownStyle={{ color: "black" }}
                                        onChange={(value, country) => handlePhoneChange(value, country)}
                                        inputProps={{ "data-testid": "mobile-input" }}  // <-- add test id here
                                    />
                                )}
                            />

                            <div className="text-danger small mt-1">{errors.mobile_no?.message}</div>
                        </div>

                        {/* Role Dropdown */}
                        <div className="col-md-4 mb-3">
                            <label htmlFor="role_id" className="form-label">
                                Role <span className="text-danger">*</span>
                            </label>
                            {/* <select
                                id="role_id"
                                className="form-select"
                                {...register("role_id", { required: "Role is required" })}
                            >
                                <option value="">Select role</option>
                                {roleList?.length > 0 &&
                                    roleList.map((item) => (
                                        <option key={item?.id} value={item?.id}>
                                            {item?.name}
                                        </option>
                                    ))}
                            </select> */}
                            <select
                                id="role_id"
                                className="form-select"
                                {...register("role_id", { required: "Role is required" })}
                                data-testid="role-input"   // <-- add this
                            >
                                <option value="">Select role</option>
                                {roleList?.length > 0 &&
                                    roleList.map((item) => (
                                        <option key={item?.id} value={item?.id}>
                                            {item?.name}
                                        </option>
                                    ))}
                            </select>

                            <div className="text-danger small mt-1">{errors.role_id?.message}</div>
                        </div>

                        {/* Username Field */}
                        {/* <div className="col-md-4 mb-3">
                            <label htmlFor="username" className="form-label">
                                Username <span className="text-danger">*</span>
                            </label>
                           
                            <input
                                id="username"
                                type="text"
                                {...register("username", { required: "Username is required" })}
                                className="form-control"
                                placeholder="Enter username"
                                data-testid="username-input"  // <-- add this
                            />
                            <div className="text-danger small mt-1">{errors.username?.message}</div>
                        </div> */}
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">
                            Submit
                        </button>
                    </div>
                </form>


            </div>
            {loading && <Loader />}
        </div>
    );
}

export default UserAdd;
