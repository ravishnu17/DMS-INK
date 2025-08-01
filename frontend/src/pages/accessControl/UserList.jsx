import React, { Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import { Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { changePwdSchema, tableStyle } from '../../constant/Util';
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { userRoutes } from '../../routes';
import { addUpdateAPI, deleteAPI, getAPI } from '../../constant/apiServices';
import { ContextProvider } from '../../App';
import Loader from '../../constant/loader';
import AuditTrail from '../configuration/AuditTrail';
import LoginIcon from '@mui/icons-material/Login';
import { axiosInstance } from '../../constant/axiosInstance';
import { API_BASE_URL } from '../../constant/baseURL';

export function UserListView() {

    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState();
    const [roleList, setRoleList] = useState([]);
    const [userList, setUserList] = useState([]);
     const [filterByStatus, setFilterByStatus] = useState();
    const [filterRole, setFilterRole] = useState();
   
    const [search, setSearch] = useState();
    const [loading, setLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [pagination, setPagination] = useState({ skip: 0, limit: 25, currentPage: 1 });
    const [auditTrail, setAuditTrail] = useState([]);
    const [toggledStatus, setToggledStatus] = useState({});

    const schema2 = yup.object().shape({
        reassign_user_id: yup.string().required("Replace user is required"),
        reason: yup.string().required("Reason is required"),
    });

    const schema3 = yup.object().shape({
        password: yup.string()
            .required("Password is required")
            .min(8, "Password must be at least 8 characters")
            .test("passwordRequirements", "Password should be Include Numbers, Symbols, and Uppercase and Lowercase Letters.", (value) =>
                [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/, /[_!@#$%^&*]/].every((pattern) =>
                    pattern.test(value)
                )
            ),
        confirmPassword: yup.string()
            .oneOf([yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    const { register: register1, handleSubmit: resetpasswordsubmit, formState: { errors: errors1 }, reset: reset1 } = useForm({ resolver: yupResolver(changePwdSchema) });

    const { register: register2, handleSubmit: reassignsubmit, formState: { errors: errors2 }, reset: reset2 } = useForm({ resolver: yupResolver(schema2) });

    const { register: register3, handleSubmit: resetPsswordSubmit, formState: { errors: errors3 }, reset: reset3 } = useForm({ resolver: yupResolver(schema3) });

    const contextProp = useContext(ContextProvider);
    const currentUser = contextProp?.currUser;
    const permissions = contextProp?.permissions;

    const modulepermission = permissions?.role_permissions?.users;
    const handlePageChange = (page) => {
        setPagination((prev) => ({
            ...prev,
            currentPage: page,
            skip: (page - 1) * prev.limit,
        }));
    };

    const handlePerRowsChange = (newLimit, page) => {
        setPagination({
            currentPage: 1,
            skip: 0,
            limit: newLimit,
        });
    };

    const getAuditTrail = (id) => {
        getAPI('audit/user/' + id).then((res) => {
            if (res?.data?.status) {
                setAuditTrail(res?.data?.data);
            } else {
                setAuditTrail([]);
            }
        })
    }
    const getRoleList = () => {
        getAPI('/access/roles?skip=0&limit=25').then((res) => {
            if (res?.data?.status) {
                setRoleList(res.data.data);
            } else {
                setRoleList([]);
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    
  const getUserList = useCallback(() => {
//   console.log("Current Filters:", { filterByStatus, filterRole, search });

  setLoading(true);

  const params = new URLSearchParams();
  params.append("skip", pagination.skip);
  params.append("limit", pagination.limit);

  if (search) params.append("search", search);
  if (filterRole) params.append("role_id", filterRole);
  if (filterByStatus !== "" && filterByStatus !== undefined && filterByStatus !== null)
    params.append("status", filterByStatus);

  getAPI(`/access/users?${params.toString()}`)
    .then((res) => {
      if (res?.data?.status) {
        setUserList(res.data.data);
        setTotalRows(res?.data?.total_count);
      } else {
        setUserList([]);
        setTotalRows(0);
      }
    })
    .catch((err) => console.log("Error fetching user list:", err))
    .finally(() => setLoading(false));
}, [pagination,filterByStatus, filterRole, search]);

  
    useEffect(() => {
        getUserList();
    }, [getUserList]);

    const handleSimulateLogin = async (name) => {
        try {
            const res = await axiosInstance.post(
                `${API_BASE_URL}access/simulate-login?username_or_email=${name}`,
                {}
            );

            const simulatedToken = res.data.access_token;
            const userId = res.data.details?.user_id;

            if (simulatedToken) {
                const result = await Swal.fire({
                    title: 'Are you sure?',
                    text: "You are about to simulate login as another user.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#28a745',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, continue',
                    cancelButtonText: 'Cancel',
                    background: '#fff',
                    color: '#000'
                });


                if (result.isConfirmed) {
                    sessionStorage.setItem('userId', userId);
                    sessionStorage.setItem('token', simulatedToken);
                    navigate("/dashboard");
                    window.location.reload();
                } else {

                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'info',
                        title: 'Simulated login cancelled',
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            }
        } catch (err) {
            console.error("Simulate login failed:", err);
        }
    };

    const getUserDetails = (userId) => {
        reset1({
            "confirm_password": "",
            "oldPassword": "",
            "password": "",
        })
        getAPI(`/access/users/` + userId).then((res) => {
            setLoading(true);
            if (res?.data) {
                setSelectedUser(res?.data?.data);
                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            } else {
                setSelectedUser();
            }
        }).catch((err) => {
            console.log(err);
        })
    }

   
    const toggleStatus = (id, status) => {
        const newStatus = status ? "InActive" : "Active";
        const payloadStatus = !status;
        setToggledStatus((prev) => ({
            ...prev,
            [id]: newStatus,
        }));

        // Show confirmation dialog
        Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${newStatus === "Active" ? "Activate" : "Deactivate"} this user?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${newStatus === "Active" ? "Activate" : "Deactivate"}!`,
            cancelButtonText: "Cancel",
        }).then((result) => {
            if (result.isConfirmed) {
                // Call API after confirmation
                getAPI(`access/users/update-status/${id}?status=${payloadStatus}`)
                    .then((res) => {
                        if (res?.data?.status) {
                            Swal.fire({
                                title: "Success",
                                text: `User status updated to ${newStatus === "Active" ? "Active" : "Deactivate"}`,
                                icon: "success",
                                confirmButtonText: "OK",
                            });
                            setToggledStatus((prev) => ({
                                ...prev,
                                [id]: newStatus,
                            }));
                            getUserList();
                        } else {
                            Swal.fire({
                                title: "Error",
                                text: res?.data?.message || "Failed to update user status",
                                icon: "error",
                                confirmButtonText: "OK",
                            });
                        }
                    })
                    .catch((err) => {
                        console.error("Error updating user status:", err);
                        Swal.fire({
                            title: "Error",
                            text: "Failed to update user status",
                            icon: "error",
                            confirmButtonText: "OK",
                        });
                    });
            }
        });

    };


    const ActionMenu = ({ row }) => {
        const [open, setOpen] = useState(false);
        const menuRef = useRef();
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (menuRef.current && !menuRef.current.contains(event.target)) {
                    setOpen(false);
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);



        return (
            <div style={{ position: "relative" }} ref={menuRef}>
                <i
                    className="fas fa-ellipsis-v"
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpen((prev) => !prev)}
                />
                {open && (
                    <div
                        style={{
                            position: "absolute",
                            background: "white",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            padding: "8px",
                            zIndex: 1,
                            top: 20,
                            left: 0,
                            display: "flex",
                            gap: "12px",
                        }}
                    >
                        <div className="d-flex justify-content-between">

                            {
                                currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" ?

                                    <>
                                        <div className="form_col ml-1">
                                            <span className="custum-group-table" >
                                                <button type="button" className="btn  btn-sm text-info" data-bs-toggle="modal" data-bs-target="#viewModel" onClick={() => { setSelectedUser(row), getAuditTrail(row.id) }} title='View' >
                                                    <i className="fas fa-eye " />
                                                </button>
                                            </span>
                                        </div>
                                        <div className="form_col ml-1">
                                            <span className="custum-group-table" >
                                                <button type="button" className="btn  btn-sm text-success" title='Update' onClick={() => navigate('/accessControl/userList/userAdd', {
                                                    state: { action: "Update", userData: row }
                                                })}>
                                                    <i className="fas fa-edit" />
                                                </button>
                                            </span>
                                        </div>
                                        <div className="form_col">
                                            <span className="custum-group-table  ">
                                                <button type="button" className="btn text-warning btn-sm" title='Change Password' data-bs-toggle="modal" data-bs-target="#resetModel" onClick={() => {
                                                    getUserDetails(row.id)
                                                }} data-testid={`user-row-${user.id}`} >
                                                    <i className="fa fa-key" />
                                                </button>
                                            </span>
                                        </div>
                                        <div className="form_col">
                                            <span className="custum-group-table  ">
                                                <button type="button" className="btn text-success-emphasis btn-sm" title='Reassign user' data-bs-toggle="modal" data-bs-target="#reassignModel" onClick={() => setSelectedUser(row)}>
                                                    <i className="fa-solid fa-retweet" />
                                                    {/* <i class="fa-solid fa-person-harassing" /> */}
                                                </button>
                                            </span>
                                        </div>
                                        <div className="form_col">
                                            <span className="custum-group-table  ">
                                                <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletefunction(row.id)}>
                                                    <i className="fa fa-trash" />
                                                </button>
                                            </span>
                                        </div>
                                    </>
                                    :

                                    <>
                                        {
                                            modulepermission?.view && (

                                                <>
                                                    <div className="form_col ml-1">
                                                        <span className="custum-group-table" >
                                                            <button type="button" className="btn  btn-sm text-info" data-bs-toggle="modal" data-bs-target="#viewModel" onClick={() => { setSelectedUser(row), getAuditTrail(row.id) }} title='View' >
                                                                <i className="fas fa-eye " />
                                                            </button>
                                                        </span>
                                                    </div>

                                                </>

                                            )

                                        }

                                        {
                                            modulepermission?.edit && (
                                                <>
                                                    <div className="form_col ml-1">
                                                        <span className="custum-group-table" >
                                                            <button type="button" className="btn  btn-sm text-success" title='Update' onClick={() => navigate('/accessControl/userList/userAdd', {
                                                                state: { action: "Update", userData: row }
                                                            })}>
                                                                <i className="fas fa-edit" />
                                                            </button>
                                                        </span>
                                                    </div>
                                                    <div className="form_col">
                                                        <span className="custum-group-table  ">
                                                            <button type="button" className="btn text-warning btn-sm" title='Change Password' data-bs-toggle="modal" data-bs-target="#resetModel" onClick={() => {
                                                                getUserDetails(row.id)
                                                            }}  >
                                                                <i className="fa fa-key" />
                                                            </button>
                                                        </span>
                                                    </div>
                                                    <div className="form_col">
                                                        <span className="custum-group-table  ">
                                                            <button type="button" className="btn text-success-emphasis btn-sm" title='Reassign user' data-bs-toggle="modal" data-bs-target="#reassignModel" onClick={() => setSelectedUser(row)}>
                                                                <i class="fa-solid fa-retweet" />
                                                                {/* <i class="fa-solid fa-person-harassing" /> */}
                                                            </button>
                                                        </span>
                                                    </div>
                                                </>
                                            )
                                        }


                                        {
                                            modulepermission?.delete && (
                                                <>
                                                    <div className="form_col">
                                                        <span className="custum-group-table  ">
                                                            <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletefunction(row.id)}>
                                                                <i className="fa fa-trash" />
                                                            </button>
                                                        </span>
                                                    </div>

                                                </>
                                            )
                                        }

                                    </>

                            }

                        </div>
                    </div>
                )}
            </div>
        );
    };
    const columns = [
        {
            name: 'Name',
            selector: row => row?.name,
            cell: (row) => (
                <label className={`text-truncate ${row?.resign ? "text-danger" : ""}`} title={row.name}>{row?.name}</label>
            )
        },
        {
            name: 'Email ID',
            selector: row => row?.email,
        },
        {
            name: 'Mobile',
            selector: row => row?.mobile_no,
        },
        {
            name: 'Role',
            selector: row => row?.role?.name,
        },
        // {
        //     name: "Action",
        //     cell: (row) => <ActionMenu row={row} />,
        //     ignoreRowClick: true,
        //     allowoverflow: true,
        //     maxwidth: '600px'
        //   },
        {
            name: "Action",
            center: true,
            cell: (row) => (
                <>
                    <div className="d-flex justify-content-between">
                        {
                            currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" ?
                                <>
                                    <div className="form_col ml-1">

                                        <span className="custum-group-table" >
                                            <button type="button" className="btn  btn-sm text-info" data-bs-toggle="modal" data-bs-target="#viewModel" onClick={() => { setSelectedUser(row), getAuditTrail(row.id) }} title='View' >
                                                <i className="fas fa-eye " />
                                            </button>
                                        </span>
                                    </div>
                                    <div className="form_col ml-1">
                                        <span className="custum-group-table">
                                            <button type="button" className="btn btn-sm text-success" title='Update' onClick={() => navigate('/accessControl/userList/userAdd', { state: { action: "Update", userData: row } })}>
                                                <i className="fas fa-edit" />
                                            </button>
                                        </span>
                                    </div>
                                    <div className="form_col">
                                        <span className="custum-group-table">
                                            <button type="button" className="btn text-warning btn-sm" title='Change Password' data-bs-toggle="modal" data-bs-target="#resetModel" onClick={() => { getUserDetails(row.id) }}>
                                                <i className="fa fa-key" />
                                            </button>
                                        </span>
                                    </div>
                                    <div className="form_col">
                                        <span className="custum-group-table">
                                            <button type="button" className="btn text-success btn-sm" title='Reset Password' onClick={() => resetPassfunction(row)}>
                                                <i className="fa fa-unlock-alt" />
                                            </button>
                                        </span>
                                    </div>
                                    <div className="form_col">
                                        <span className="custum-group-table">
                                            <button type="button" className="btn text-success-emphasis btn-sm" title='Reassign user' data-bs-toggle="modal" data-bs-target="#reassignModel" onClick={() => setSelectedUser(row)}>
                                                <i className="fa-solid fa-retweet" />
                                            </button>
                                        </span>
                                    </div>
                                    <div className="form_col">
                                        <span className="custum-group-table">
                                            <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletefunction(row.id)}>
                                                <i className="fa fa-trash" />
                                            </button>
                                        </span>
                                    </div>
                                    <div className="form_col">
                                        <span className="custum-group-table">

                                            {row.active ? (
                                                <button
                                                    type="button"
                                                    className="btn text-success btn-sm"
                                                    title="Active"
                                                    onClick={() => toggleStatus(row.id, row.active)}
                                                >
                                                    <i className="fa-solid fa-toggle-on" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn text-secondary btn-sm"
                                                    title="Inactive"
                                                    onClick={() => toggleStatus(row.id, row.active)}
                                                >
                                                    <i className="fa-solid fa-toggle-off" />
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                    {/* Simulate Login button for Admin or Super Admin */}
                                    {currentUser.role_id === 1 && (
                                        <div className="form_col">
                                            <span className="custum-group-table">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm text-primary"
                                                    title="Simulate Login"
                                                    onClick={() => handleSimulateLogin(row.username)}
                                                >
                                                    <i className="fa fa-sign-in-alt" />
                                                </button>

                                            </span>
                                        </div>
                                    )}

                                </>
                                :
                                <>
                                    {
                                        modulepermission?.view && (
                                            <>
                                                <div className="form_col ml-1">
                                                    <span className="custum-group-table" >
                                                        <button type="button" className="btn  btn-sm text-info" data-bs-toggle="modal" data-bs-target="#viewModel" onClick={() => { setSelectedUser(row), getAuditTrail(row.id) }} title='View' >
                                                            <i className="fas fa-eye " />
                                                        </button>
                                                    </span>
                                                </div>
                                            </>
                                        )
                                    }

                                    {
                                        modulepermission?.edit && (
                                            <>
                                                <div className="form_col ml-1">
                                                    <span className="custum-group-table">
                                                        <button type="button" className="btn btn-sm text-success" title='Update' onClick={() => navigate('/accessControl/userList/userAdd', { state: { action: "Update", userData: row } })}>
                                                            <i className="fas fa-edit" />
                                                        </button>
                                                    </span>
                                                </div>
                                                <div className="form_col">
                                                    <span className="custum-group-table">
                                                        <button type="button" className="btn text-warning btn-sm" title='Change Password' data-bs-toggle="modal" data-bs-target="#resetModel" onClick={() => { getUserDetails(row.id) }}>
                                                            <i className="fa fa-key" />
                                                        </button>
                                                    </span>
                                                </div>
                                                <div className="form_col">
                                                    <span className="custum-group-table">
                                                        <button type="button" className="btn text-success-emphasis btn-sm" title='Reassign user' data-bs-toggle="modal" data-bs-target="#reassignModel" onClick={() => setSelectedUser(row)}>
                                                            <i className="fa-solid fa-retweet" />
                                                        </button>
                                                    </span>
                                                </div>
                                                <div className="form_col">
                                                    <span className="custum-group-table">

                                                        {row.active ? (
                                                            <button
                                                                type="button"
                                                                className="btn text-success btn-sm"
                                                                title="Active"
                                                                onClick={() => toggleStatus(row.id, row.active)}
                                                            >
                                                                <i className="fa-solid fa-toggle-on" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="btn text-secondary btn-sm"
                                                                title="Inactive"
                                                                onClick={() => toggleStatus(row.id, row.active)}
                                                            >
                                                                <i className="fa-solid fa-toggle-off" />
                                                            </button>
                                                        )}
                                                    </span>
                                                </div>
                                            </>
                                        )
                                    }

                                    {
                                        modulepermission?.delete && (
                                            <div className="form_col">
                                                <span className="custum-group-table">
                                                    <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletefunction(row.id)}>
                                                        <i className="fa fa-trash" />
                                                    </button>
                                                </span>
                                            </div>
                                        )
                                    }
                                </>
                        }

                    </div>
                </>
            ),
            ignoreRowClick: true,
            allowoverflow: true,
            maxwidth: '600px'
        }
    ];

    const deletefunction = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteAPI('/access/users/' + id).then((res) => {
                    if (res?.data.status) {
                        //success
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'Deleted!',
                            text: res.data.details,
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                            background: '#28a745',  // success green
                            color: '#fff'
                        });

                        getUserList();
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
                })

            }
        })
    }

    const resetPassfunction = (data) => {
        let apiData = {
            "email": data?.email,
        }

        addUpdateAPI('POST', 'access/forgot-password', apiData).then((res) => {

            if (res?.data?.status) {
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
    }

    const onForgotPasswordSumitSubmit = (data) => {
        addUpdateAPI("POST", '/access/change-password?user_id=' + selectedUser.id + '&old_password=' + data.oldPassword + '&new_password=' + data.confirm_password).then((res) => {
            getUserList();

            if (res?.data.status) {
                const modal = document.getElementById("resetModel");
                const modalInstance = bootstrap.Modal.getInstance(modal); // Get the Bootstrap modal instance
                modalInstance.hide();
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

        })


    }

    const onForgotPasswordSumitAdmin = (data) => {

        let apiData = {
            "user_id": selectedUser?.id,
            "password": data?.password,
        }

        addUpdateAPI('POST', 'access/admin-changepassword', apiData).then((res) => {
            if (res?.data?.status) {
                const modal = document.getElementById("resetModel");
                const modalInstance = bootstrap.Modal.getInstance(modal); // Get the Bootstrap modal instance
                modalInstance.hide();
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
            } else {
                setLoading(false);
            }
        }).catch((err) => {
            console.log(err);
            setLoading(false);
        }).finally(() => {
            setLoading(false);
        })
    }

    const userreassignSubmit = (data) => {
        // console.log(data, selectedUser?.id);
        setLoading(true);
        addUpdateAPI("PUT", `access/reassign-user?user_id=${selectedUser?.id}&new_user_id=${data.reassign_user_id}&reason=${data.reason}`).then((res) => {
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
            getUserList();
            const modal = document.getElementById("reassignModel");
            const modalInstance = bootstrap.Modal.getInstance(modal); // Get the Bootstrap modal instance
            modalInstance.hide();
        }).catch((err) => {
            Swal.fire({
                icon: "warning",
                title: 'Something went wrong!',
                text: res?.data?.details || 'Something went wrong!',
                confirmButtonText: 'OK',
                background: 'rgb(255, 255, 255)',
                color: '  #000000'
            });
        }).finally(() => {
            setLoading(false);
        })

    }

    useEffect(() => {
        getRoleList();
    }, [])

    useEffect(() => {
        getUserList();
    }, [search, filterRole])


    return (
        <>
            <div className='d-flex justify-content-between p-2 flex-wrap bg-white'>
                <div className='p-2 col-lg-3 col-12'>
                    <h6 className='fw-bold mb-0'>Users</h6>
                </div>
                <div className='d-flex justify-content-end col-lg-9 col-12 flex-wrap gap-1 mb-2'>
                    <div className='row col-12'>
                       
                        
                          <div className="col-md-3 p-0 pe-2">
                            <label className='col-form-label p-0'>Filter by Status</label>
                            <select className="form-control form-select" onChange={(e) => setFilterByStatus(e.target.value)} >
                                <option value="" defaultChecked disabled >Filter by Status</option>
                                <option value="" defaultChecked>All</option>
                                 <option value="true" >Active</option>
                                 <option value="false" >Inactive</option>
                            </select>
                        </div>
                        <div className="col-md-3 p-0 pe-2">
                            <label className='col-form-label p-0'>Filter by Role</label>
                            <select className="form-control form-select" onChange={(e) => setFilterRole(e.target.value)} >
                                <option value="" defaultChecked disabled >Filter by role</option>
                                <option value="" defaultChecked>All</option>
                                {
                                    roleList.length > 0 &&
                                    roleList.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className='col-md-6 p-0 pe-2'>
                            <label className='col-form-label p-0'></label>
                            <div className='d-flex'>
                                <div className="me-2 d-flex align-items-center w-100">
                                    <button className='btn bnt-sm adminsearch-icon'>
                                        <i className="fa fa-search " aria-hidden="true"></i>
                                    </button>
                                    <input type="text" className="form-control adminsearch" placeholder="Search by name, email, mobile" title="Search by name, email, mobile" onChange={(e) => setSearch(e.target.value)} />

                                </div>
                                {
                                    currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" ?

                                        <>
                                            <button className='btn btn-sm px-4 adminBtn' title='Add'
                                                onClick={() => navigate('/accessControl/userList/userAdd', {
                                                    state: { action: "Add", userId: null }
                                                })}
                                            > Add </button>
                                        </>
                                        : <>
                                            {
                                                modulepermission?.add && (
                                                    <button className='btn btn-sm px-4 adminBtn' title='Add'
                                                                                        onClick={() => navigate('/accessControl/userList/userAdd', {
                                                            state: { action: "Add", userId: null }
                                                        })}
                                                    > Add </button>
                                                )

                                            }

                                        </>
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='card' style={{ margin: "7px" }}>
                <DataTable
                    columns={columns}
                    data={userList}
                    customStyles={tableStyle}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    paginationDefaultPage={pagination.currentPage}
                    paginationPerPage={pagination.limit}
                    paginationRowsPerPageOptions={[25, 50, 75, 100]}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handlePerRowsChange}
                    highlightOnHover
                    pointerOnHover
                    responsive
                    noDataComponent={null}
                // progressPending={loading}
                />

            </div>
            <div className="modal fade " id="viewModel" tabIndex="-1" aria-labelledby="viewModelLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">View User</h5>
                            <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close" ></button>
                        </div>

                        <div className="modal-body">
                            <div className='row ms-1'>
                                <div className='col-md-4 mb-1'>
                                    <label className='form-label'>Name</label>
                                    <p className="ms-2 fw-bold">{selectedUser?.name}</p>
                                </div>

                                <div className='col-md-4 mb-1'>
                                    <label className='form-label'>Email</label>
                                    <p className="ms-2 fw-bold">{selectedUser?.email}</p>

                                </div>

                                <div className='col-md-4 mb-1'>
                                    <label className='form-label'>Mobile No</label>
                                    <p className="ms-2 fw-bold"> {selectedUser?.country_code ? '+' + selectedUser?.country_code : "+91 "} {selectedUser?.mobile_no}</p>

                                </div>

                                <div className='col-md-4 mb-1'>
                                    <label className='form-label'>Role</label>
                                    <p className="ms-2 fw-bold">{selectedUser?.role?.name}</p>

                                </div>

                                {/* <div className='col-md-4 mb-1'>
                                    <label className='form-label'>User Name</label>
                                    <p className="ms-2 fw-bold">{selectedUser?.username}</p>
                                </div> */}

                                {
                                    selectedUser?.resign &&
                                    <div className='col-md-4 mb-1'>
                                        <label className='form-label'>Status</label>
                                        <p className="ms-2 fw-bold text-danger">{selectedUser?.resign_reason}</p>
                                    </div>
                                }


                            </div>
                            <div className="mt-2 border-top border-secondary">
                                <h5 className="mb-3 text-primary text-center mt-2">Activity History</h5>
                                <AuditTrail history={auditTrail} />
                            </div>
                        </div>
                        <div className="modal-footer">

                            <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>

                    </div>
                </div>
            </div>

            <div className="modal fade " id="resetModel" tabIndex="-1" aria-labelledby="resetModelLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Change Password</h5>
                            <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close" ></button>
                        </div>
                        {
                            currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" ?
                                <form onSubmit={resetPsswordSubmit(onForgotPasswordSumitAdmin)}>
                                    <div className="modal-body">
                                        <div className="row  ms-1">
                                            <div className="col-md-4 mb-1">
                                                <label className="form-label">Password <span className="text-danger">*</span></label>
                                                <input type="password" autoComplete='off' className="form-control" placeholder="Enter password" {...register3("password")} />
                                                <p className="text-danger">{errors3?.password?.message}</p>
                                            </div>

                                            <div className="col-md-4 mb-1">
                                                <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                                                <input type="password" autoComplete='off' className="form-control" placeholder="Confirm password" {...register3("confirmPassword")} />
                                                <p className="text-danger">{errors3?.confirmPassword?.message}</p>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-sm btn-primary px-4 p-1 adminBtn">Submit</button>
                                        <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </form>
                                :
                                <form onSubmit={resetpasswordsubmit(onForgotPasswordSumitSubmit)}>
                                    <div className="modal-body">
                                        <div className="row  ms-1">
                                            <div className="col-md-4 mb-1">
                                                <label className="form-label">Old Password <span className="text-danger">*</span></label>
                                                <input type="password" autoComplete='off' className="form-control" placeholder="Enter password" {...register1("oldPassword")} />
                                                <p className="text-danger">{errors1.oldPassword?.message}</p>
                                            </div>

                                            <div className="col-md-4 mb-1">
                                                <label className="form-label">Password <span className="text-danger">*</span></label>
                                                <input type="password" autoComplete='off' className="form-control" placeholder="Enter password" {...register1("password")} />
                                                <p className="text-danger">{errors1.password?.message}</p>
                                            </div>

                                            <div className="col-md-4 mb-1">
                                                <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                                                <input type="password" autoComplete='off' className="form-control" placeholder="Confirm password" {...register1("confirm_password")} />
                                                <p className="text-danger">{errors1.confirm_password?.message}</p>
                                            </div>
                                        </div>

                                    </div>
                                    <div className="modal-footer">
                                        <button type="submit" className="btn btn-sm btn-primary px-4 p-1 adminBtn">Submit</button>
                                        <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </form>
                        }

                    </div>
                </div>
            </div>

            <div className="modal fade " id="reassignModel" tabIndex="-1" aria-labelledby="reassignModelLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Replace User</h5>
                            <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close" ></button>
                        </div>

                        <form onSubmit={reassignsubmit(userreassignSubmit)}>
                            <div className="modal-body">
                                <div className="row ms-1">
                                    <div className="col-md-4 mb-1">
                                        <label className='form-label'>Selected user</label>
                                        <p className="ms-2 fw-bold">{selectedUser?.name}</p>
                                    </div>
                                    <div className="col-md-4 mb-1">
                                        <label className="form-label"> Replace with <span className='text-danger'>*</span></label>
                                        <select className='form-control form-select' {...register2("reassign_user_id")}  >
                                            <option value="" >Select User</option>
                                            {
                                                userList.length > 0 &&
                                                userList?.map((item, index) => {
                                                    return (<option key={item.id} value={item.id}> {item.name}</option>)
                                                })
                                            }

                                        </select>
                                        <p className="text-danger">{errors2.reassign_user_id?.message}</p>
                                    </div>
                                    <div className="col-md-4 mb-1">
                                        <label className="form-label"> Reason <span className='text-danger'>*</span></label>
                                        <select className='form-control form-select' {...register2("reason")}  >
                                            <option value="">Select Reason</option>
                                            <option value="Retried">Retried</option>
                                            <option value="Resigned">Resigned</option>
                                        </select>
                                        <p className="text-danger">{errors2.reason?.message}</p>
                                    </div>
                                </div>

                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-sm btn-primary px-4 p-1 adminBtn">Submit</button>
                                <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>

            {
                loading && (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
                        <Loader />
                    </div>
                )
            }
        </>
    );
}

function UserList() {
    return (
        <Suspense>
            <Routes>
                {[{ path: '/', element: UserListView }, ...userRoutes].map((route, index) => (
                    route.element && <Route
                        key={index}
                        path={route.path}
                        element={<route.element />}
                    />
                ))}
            </Routes>
        </Suspense>


    )
}

export default UserList