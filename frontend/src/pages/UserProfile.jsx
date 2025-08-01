
import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { addUpdateAPI, getAPI } from '../constant/apiServices';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { isValidPhoneNumber } from 'libphonenumber-js';
import userProfile from "/src/assets/user.png";
import Loader from '../constant/loader';



// Schemas
const profileSchema = yup.object().shape({
    gender: yup.string().required(),
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),

    mobile_no: yup
        .string()
        .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
        .required('Mobile number is required'),

    whatsapp_no: yup
        .string()
        .matches(/^[0-9]{10}$/, 'WhatsApp number must be 10 digits')
        .required('WhatsApp number is required'),
    dob: yup.string().required('Date of birth is required'),
    designation: yup.string().required('Designation is required'),
});

const passwordSchema = yup.object().shape({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup
        .string()
        .min(6, 'New password must be at least 6 characters')
        .required('New password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
    dob: yup.string().required('Date of birth is required'),
    designation: yup.string().required('Designation is required'),
});

// const passwordSchema = yup.object().shape({
//     currentPassword: yup.string().required('Current password is required'),
//     newPassword: yup
//         .string()
//         .min(6, 'New password must be at least 6 characters')
//         .required('New password is required'),
//     confirmPassword: yup
//         .string()
//         .oneOf([yup.ref('newPassword')], 'Passwords must match')
//         .required('Please confirm your password'),
// });

const UserProfile = () => {
    const navigate = useNavigate();


    const [activeSection, setActiveSection] = useState('personal');
    const [phone, setPhone] = useState({ country_code: '91', mobile_no: '' });
    const [whatsapp, setWhatsapp] = useState({ country_code: '91', mobile_no: '' });
    const [img, setImg] = useState({ url: null, file: null });
    const imgRef = useRef();
    const [showPwd, setShowPwd] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        reset, control
    } = useForm({
        resolver: yupResolver(profileSchema),
    });

    const {
        register: pwdRegister,
        handleSubmit: pwdSubmit,
        formState: { errors: pwdErrors },
        reset: pwdReset
    } = useForm({
        resolver: yupResolver(passwordSchema),
    });

    const onSubmitProfile = (data) => {
        setLoading(true);
        delete data.province;
        delete data.role;

        data.mobile_no = phone?.mobile_no;
        data.mobile_country_code = phone?.country_code;
        data.whatsapp_no = whatsapp?.mobile_no;
        data.whatsapp_country_code = whatsapp?.country_code;
        data?.profile_pic && delete data?.profile_pic;

        const fm = new FormData();
        fm.append('user', JSON.stringify(data));
        img?.file && fm.append('profile_pic', img?.file);
        addUpdateAPI('PUT', 'access/current-user/put', fm).then((res) => {
            if (res?.data?.status) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Updated!',
                    text: res?.data?.details || 'Success',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: ' #28a745',
                    color: '  #ffff'
                });
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Error!',
                    text: res?.data?.details || 'failed',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: ' #dc3a3a',
                    color: '  #ffff'
                });
            }
        }).catch((err) => {
            console.log(err);

        }).finally(() => {
            setLoading(false);
        })
    };
    
    const getUserProfile = () => {
        setLoading(true);
        getAPI('access/current-user').then((res) => {
            if (res?.data?.status) {
                reset(res?.data?.data);

                setPhone({ country_code: res?.data?.data?.mobile_country_code, mobile_no: res?.data?.data?.mobile_no });
                setWhatsapp({ country_code: res?.data?.data?.whatsapp_country_code || 91, mobile_no: res?.data?.data?.whatsapp_no });
                setImg({ url: res?.data?.data?.profile_pic, file: null });
            }
        }).catch((err) => {
            console.log(err);
        }
        ).finally(() => {
            setLoading(false);
        })
    }
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

    const handleWhatsappChange = (phone, country) => {
        let number = phone?.slice(country?.dialCode?.length)
        var isValidNumber = null
        if (number?.split('')?.every((item) => item === "0")) {
            isValidNumber = false
        } else if (number?.split('')?.[0] === "0") {
            isValidNumber = false
        } else {
            isValidNumber = isValidPhoneNumber(phone, country?.countryCode?.toUpperCase());
        }

        setWhatsapp({ mobile_no: number, country_code: country?.dialCode, error: isValidNumber ? "" : "Enter a valid number" });
        setValue('whatsapp_country_code', country?.dialCode)
        setValue('whatsapp_no', number, { shouldValidate: true });
    }

    const onSubmitPassword = (data) => {
        setLoading(true);

        addUpdateAPI('POST', 'access/change-password?user_id=' + sessionStorage.getItem('userId')
            + '&old_password=' + data?.currentPassword
            + '&new_password=' + data?.newPassword).then((res) => {

                if (res?.data?.status) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Updated!',
                        text: res?.data?.details || 'Success',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        background: ' #28a745',
                        color: '  #ffff'
                    });
                    sessionStorage.clear();
                    navigate("/login");
                } else {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'error',
                        title: 'Error!',
                        text: res?.data?.details || 'failed',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                        background: ' #dc3a3a',
                        color: '  #ffff'
                    });
                }
            }).catch((err) => {
                console.log(err);

            }).finally(() => {
                setLoading(false);
            })
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const imageUrl = URL.createObjectURL(file);
            setImg({ url: imageUrl, file: file });
        }
    };

    useEffect(() => {
        getUserProfile();
    }, [])
        
  


    return (
        <>
            <div className="d-flex bg-light">
                <aside
                    className="bg-white p-3 border border-2 rounded ms-5"
                    style={{
                        width: '260px',
                        marginTop: '1rem',
                        marginBottom: '1rem',
                    }}
                >
                    <div>

                        <div className="position-relative text-center ">
                            <img
                                src={img.url ? img.url : userProfile}
                                alt="User"
                                className="rounded-circle border shadow mb-2"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                            />

                            {/* Edit Icon Overlay */}
                            <span
                                onClick={() => imgRef.current.click()}
                                style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    right: '45px',
                                    backgroundColor: '#fff',
                                    borderRadius: '50%',
                                    padding: '6px',
                                    boxShadow: '0 0 4px rgba(0,0,0,0.2)',
                                    cursor: 'pointer',
                                    paddingRight: '9px',
                                    paddingLeft: '9px',
                                }}
                            >
                                <i className="fa fa-pen text-primary" style={{ fontSize: '14px' }} />
                            </span>

                            {/* Hidden file input */}
                            <input
                                id="upload-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                ref={imgRef}
                                style={{ display: 'none' }}
                            />
                        </div>


                        <ul className="nav flex-column mt-3">
                            <li className="nav-item mb-2">
                                <button
                                    className={`btn btn-sm w-100 text-start fw-semibold ${activeSection === 'personal'
                                        ? 'btn-warning'
                                        : 'btn-outline-warning text-dark'
                                        }`}
                                    onClick={() => setActiveSection('personal')}
                                >
                                    Personal Information
                                </button>
                            </li>
                            <li className="nav-item mb-2">
                                <button
                                    className={`btn btn-sm w-100 text-start fw-semibold ${activeSection === 'login'
                                        ? 'btn-warning'
                                        : 'btn-outline-warning text-dark'
                                        }`}
                                    onClick={() => { setActiveSection('login'); pwdReset(); }}
                                >
                                    Change Password
                                </button>
                            </li>
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow-1 p-3">
                    <div className="card shadow-sm rounded">
                        <div className="card-body">
                            {activeSection === 'personal' && (
                                <form onSubmit={handleSubmit(onSubmitProfile)}>
                                    <h5 className="mb-4 fw-bold">Personal Information</h5>

                                    <div className="mb-3">
                                        <label className="form-label d-block">Gender</label>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                value="male"
                                                {...register('gender')}
                                                className="form-check-input"
                                                id="male"
                                            />
                                            <label className="form-check-label" htmlFor="male">
                                                Male
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                value="female"
                                                {...register('gender')}
                                                className="form-check-input"
                                                id="female"
                                            />
                                            <label className="form-check-label" htmlFor="female">
                                                Female
                                            </label>
                                        </div>
                                        {errors.gender && (
                                            <p className="text-danger small mt-1">{errors.gender.message}</p>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            className="form-control"
                                            {...register('name')}
                                            placeholder="Enter your name"
                                        />
                                        {errors.name && (
                                            <p className="text-danger small">{errors.name.message}</p>
                                        )}
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Mobile <span className='text-danger'>*</span></label>
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
                                                    />
                                                )}
                                            />

                                            <div className="text-danger small mt-1">{errors.mobile_no?.message}</div>
                                        </div>
                                        {/* <div className="mb-3 col-md-6">
                                            <label className="form-label">WhatsApp Number</label>
                                            <input
                                                className="form-control"
                                                {...register('whatsapp_no')}
                                                placeholder="Enter WhatsApp number"
                                            />
                                            {errors.whatsapp_no && (
                                                <p className="text-danger small">{errors.whatsapp_no.message}</p>
                                            )}
                                        </div> */}
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Whatsapp Number <span className='text-danger'>*</span></label>
                                            <Controller
                                                name="whatsapp_no"
                                                control={control}
                                                rules={{ required: "Whatsapp number is required" }}
                                                render={({ field }) => (
                                                    <PhoneInput
                                                        {...field}
                                                        id="whatsapp_no"
                                                        country="in"
                                                        value={`${whatsapp?.country_code || ""}${whatsapp?.mobile_no || ""}`}
                                                        enableSearch
                                                        placeholder="Enter whatsapp number"
                                                        inputStyle={{ width: "100%", height: "30px" }}
                                                        dropdownStyle={{ color: "black" }}
                                                        onChange={(value, country) => handleWhatsappChange(value, country)}
                                                        inputProps={{ "data-testid": "mobile-input" }}  // <-- add test id here

                                                    />
                                                )}
                                            />
                                            <div className="text-danger small mt-1">{errors.whatsapp_no?.message}</div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Date of Birth</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            max={new Date().toISOString().split("T")[0]} // Prevent future dates
                                            {...register('dob')}
                                        />
                                        {errors.dob && (
                                            <p className="text-danger small">{errors.dob.message}</p>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Designation</label>
                                        <input
                                            className="form-control"
                                            {...register('designation')}
                                            placeholder="Enter designation"
                                        />
                                        {errors.designation && (
                                            <p className="text-danger small">{errors.designation.message}</p>
                                        )}
                                    </div>

                                    <div className="float-end mt-4">
                                        {/* <button className="btn btn-outline-warning" type="reset">
                                        Discard Changes
                                    </button> */}
                                        <button className="btn btn-sm adminBtn" type="submit">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            )}

                            {activeSection === 'login' && (
                                <form onSubmit={pwdSubmit(onSubmitPassword)}>
                                    <h5 className="mb-4 fw-bold">Change Password</h5>

                                    <div className="mb-3">
                                        <label className="form-label">Current Password</label>
                                        <div className="input-group mb-1">
                                            <input
                                                type={showPwd?.currentPassword ? "text" : "password"}
                                                className="form-control"
                                                {...pwdRegister('currentPassword')}
                                                placeholder="Enter current password"
                                            />
                                            <span className="input-group-text border" onClick={() => setShowPwd(pre => ({ ...pre, currentPassword: !pre.currentPassword }))}>
                                                {showPwd?.currentPassword ? <i className="fa-solid fa-eye-slash" /> : <i className="fa-solid fa-eye" />}
                                            </span>
                                        </div>
                                        {pwdErrors.currentPassword && (
                                            <p className="text-danger small">{pwdErrors.currentPassword.message}</p>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">New Password</label>
                                        <div className="input-group mb-1">
                                            <input
                                                type={showPwd?.newPassword ? "text" : "password"}
                                                className="form-control"
                                                {...pwdRegister('newPassword')}
                                                placeholder="Enter new password"
                                            />
                                            <span className="input-group-text border" onClick={() => setShowPwd(pre => ({ ...pre, newPassword: !pre.newPassword }))}>
                                                {showPwd?.newPassword ? <i className="fa-solid fa-eye-slash" /> : <i className="fa-solid fa-eye" />}
                                            </span>
                                        </div>
                                        {pwdErrors.newPassword && (
                                            <p className="text-danger small">{pwdErrors.newPassword.message}</p>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Confirm New Password</label>
                                        <div className="input-group mb-1">
                                            <input
                                                type={showPwd?.confirmPassword ? "text" : "password"}
                                                className="form-control"
                                                {...pwdRegister('confirmPassword')}
                                                placeholder="Confirm new password"
                                            />
                                            <span className="input-group-text border" onClick={() => setShowPwd(pre => ({ ...pre, confirmPassword: !pre.confirmPassword }))}>
                                                {showPwd?.confirmPassword ? <i className="fa-solid fa-eye-slash" /> : <i className="fa-solid fa-eye" />}
                                            </span>
                                        </div>
                                        {pwdErrors.confirmPassword && (
                                            <p className="text-danger small">{pwdErrors.confirmPassword.message}</p>
                                        )}
                                    </div>

                                    <div className="float-end mt-4">
                                        {/* <button id="discard" className="btn btn-sm btn-primary" type="reset">
                                        Discard
                                    </button> */}
                                        <button className="btn btn-sm btn-success text-white" type="submit">
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            {
                loading && (
                    <div className="d-flex justify-content-center align-items-center" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <Loader />
                    </div>
                )
            }
        </>
    );
};

export default UserProfile;

