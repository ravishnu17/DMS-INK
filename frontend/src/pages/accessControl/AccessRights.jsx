import React, { useContext, useEffect, useState } from 'react'
import { checkRights, RoleIds } from '../../constant/Util';
import { ContextProvider } from '../../App';
import { addUpdateAPI, getAPI } from '../../constant/apiServices';
import Loader from '../../constant/loader';
// import '../styles/admin.css';

function AccessRights() {
    // useContext(ContextProvider);
    const context = useContext(ContextProvider);
    if (!context) {
        window.location.reload();
        return <div>Loading...</div>; // Temporary fallback
    }
    const { navState, setNavState, currUser, permissions } = context;


    const [activeRole, setActiveRole] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false)
    // const [handleRights, setHandleRights] = useState([]);
    const [rights, setRights] = useState({
        role_id: activeRole,
        modules: []
    });

    const modulepermission = permissions?.role_permissions?.[`access rights`];




    const getRoles = () => {
        setLoading(true)
        getAPI("/access/roles").then((res) => {
            if (res?.data?.status) {
                setRoles(res?.data?.data);
            } else {
                setRoles([]);
            }
        }).catch((err) => {
            console.log(err);
            setRoles([]);
        }).finally(() => {
            setLoading(false)
        })
    }
    const getRights = (id) => {
        getAPI("/access/role-module-features?role_id=" + id).then((res) => {
            // console.log("Acces Rights res", res);
            if (res?.data?.status) {
                setRights((prevRights) => ({
                    ...prevRights,
                    modules: res?.data?.data?.permission
                }));
            }
        })
    }

    const handleRoleClick = (role_id) => {
        setActiveRole(role_id);
        getRights(role_id);
    };

    const handleAllCheck = (features) => {
        return !features?.some((item) => item?.status === false);
    };

    const handleAll = async (item) => {


        try {
            let check = handleAllCheck(item?.features);
            const status = !check;
            const sendData = item?.features?.map((ite) => ({
                id: ite.id,
                status: status
            }));
            const res = await addUpdateAPI("PUT", "/access/role-module-features", sendData);
            if (res?.data?.status) {
                getRights(activeRole);
            } else {
                Swal.fire({
                    icon: "warning",
                    title: 'Something went wrong!',
                    text: res?.data?.detail || 'Something went wrong!',
                    confirmButtonText: 'OK',
                    background: 'rgb(255, 255, 255)',
                    color: '  #000000'
                });
            }
        } catch (err) {
            console.error("API Error:", err);
        }
    };

    const handleSingle = async (feature, module) => {
        const status = !feature.status;
        try {
            const res = await addUpdateAPI("PUT", "/access/role-module-features/" + feature?.id + "?status=" + status);
            if (res?.data?.status) {
                getRights(activeRole);
            } else {
                //error
                Swal.fire({
                    icon: "warning",
                    title: 'Something went wrong!',
                    text: res?.data?.detail || 'Something went wrong!',
                    confirmButtonText: 'OK',
                    background: 'rgb(255, 255, 255)',
                    color: '  #000000'
                });

            }
        } catch (err) {
            console.error("API Error:", err);
        }
    };

    useEffect(() => {
        if (roles.length > 0) {
            setActiveRole(roles[0]?.id);
            getRights(roles[0]?.id);
        }
    }, [roles]);

    useEffect(() => {
        getRoles();
    }, [])
    return (
        <div>
            <div className="container p-3">
                <div className="row">
                    <div className="col-12 text-center">
                        <div className='card p-2'>
                            <div className='card-header bg-white d-flex justify-content-between'>
                                <h5 className='fw-bold justify-content-center mt-2'>Access Rights</h5>
                                <h6 className='fw-bold justify-content-center mt-2' style={{ color: "#a64ff7" }}>Checking / unchecking the box will automatically save the changes.</h6>
                                <ul className="nav nav-pills justify-content-center mt-2" id="myTab" role="tablist">
                                    {roles.map((items, index) => {
                                        if (!items?.name?.includes("User")) {
                                            return (
                                                <li className="nav-item ms-3" role="presentation" key={index}>
                                                    <button
                                                        className={`nav-link ${activeRole === items?.id ? "active" : ""}`}
                                                        id={items?.name}
                                                        data-bs-toggle="tab"
                                                        data-bs-target="#home"
                                                        type="button"
                                                        role="tab"
                                                        aria-controls="home"
                                                        onClick={() => handleRoleClick(items?.id)}
                                                        style={{ color: activeRole === items?.id ? "white" : "black" }}
                                                    >
                                                        {items?.name}
                                                    </button>
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}
                                </ul>
                            </div>
                            <div className='card-body'>
                                <div className="tab-content" id="myTabContent">
                                    <div className='row'>
                                        {currUser?.role?.name === "Super Admin" ? (
                                            <>

                                                <div className="row mt-4">
                                                    {rights.modules.map((module, index) => (
                                                        <div className="col-lg-2 mb-3" key={module.module_id}>
                                                            <div className="form-check d-flex">
                                                                <input className="form-check-input" type="checkbox"
                                                                    id={`flexcheck${module.module_id}`}
                                                                    checked={handleAllCheck(module?.features)}
                                                                    onClick={() => { handleAll(module) }} />
                                                                <label className="form-check-label ms-2 fw-bold" htmlFor={`flexcheck${module.module_id}`}>
                                                                    {module.module_name}
                                                                </label>
                                                            </div>
                                                            <div className="ms-4 mt-2">
                                                                {module.features.map((feature, i) => (
                                                                    <div className="form-check d-flex" key={feature.id}>
                                                                        <input className="form-check-input" type="checkbox"
                                                                            checked={feature.status}
                                                                            id={`flexcheck${module.module_id}-${feature.id}`}
                                                                            onClick={() => { handleSingle(feature, module) }} />
                                                                        <label className="form-check-label ms-2" htmlFor={`flexcheck${module.module_id}-${feature.id}`}>
                                                                            {feature.feature_name}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                            </>
                                        ) : currUser?.role?.name === "Admin" ? (
                                            <>
                                                {
                                                    activeRole == 2 ? (
                                                        <div className="row mt-4">
                                                            {rights.modules.map((module, index) => (
                                                                <div className="col-lg-2 mb-3" key={module.module_id}>
                                                                    <div className="form-check d-flex">
                                                                        <input className="form-check-input" type="checkbox"
                                                                            id={`flexcheck${module.module_id}`}
                                                                            checked={handleAllCheck(module?.features)}
                                                                            disabled />
                                                                        <label className="form-check-label ms-2 fw-bold" htmlFor={`flexcheck${module.module_id}`}>
                                                                            {module.module_name}
                                                                        </label>
                                                                    </div>
                                                                    <div className="ms-4 mt-2">
                                                                        {module.features.map((feature, i) => (
                                                                            <div className="form-check d-flex" key={feature.id}>
                                                                                <input className="form-check-input" type="checkbox"
                                                                                    checked={feature.status}

                                                                                    id={`flexcheck${module.module_id}-${feature.id}`}
                                                                                    disabled />
                                                                                <label className="form-check-label ms-2" htmlFor={`flexcheck${module.module_id}-${feature.id}`}>
                                                                                    {feature.feature_name}
                                                                                </label>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                    ) :
                                                        (
                                                            <div className="row mt-4">
                                                                {rights.modules.map((module, index) => (
                                                                    <div className="col-lg-2 mb-3" key={module.module_id}>
                                                                        <div className="form-check d-flex">
                                                                            <input className="form-check-input" type="checkbox"
                                                                                id={`flexcheck${module.module_id}`}
                                                                                checked={handleAllCheck(module?.features)}
                                                                                onClick={() => { handleAll(module) }} />
                                                                            <label className="form-check-label ms-2 fw-bold" htmlFor={`flexcheck${module.module_id}`}>
                                                                                {module.module_name}
                                                                            </label>
                                                                        </div>
                                                                        <div className="ms-4 mt-2">
                                                                            {module.features.map((feature, i) => (
                                                                                <div className="form-check d-flex" key={feature.id}>
                                                                                    <input className="form-check-input" type="checkbox"
                                                                                        checked={feature.status}
                                                                                        id={`flexcheck${module.module_id}-${feature.id}`}
                                                                                        onClick={() => { handleSingle(feature, module) }} />
                                                                                    <label className="form-check-label ms-2" htmlFor={`flexcheck${module.module_id}-${feature.id}`}>
                                                                                        {feature.feature_name}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                }

                                            </>
                                        ) : <>
                                            {modulepermission?.view && (modulepermission?.edit || modulepermission?.add) ? (
                                                <>
                                                    {
                                                        activeRole == 2 ? (
                                                            <div className="row mt-4">
                                                                {rights.modules.map((module, index) => (
                                                                    <div className="col-lg-2 mb-3" key={module.module_id}>
                                                                        <div className="form-check d-flex">
                                                                            <input className="form-check-input" type="checkbox"
                                                                                id={`flexcheck${module.module_id}`}

                                                                                disabled />
                                                                            <label className="form-check-label ms-2 fw-bold" htmlFor={`flexcheck${module.module_id}`}>
                                                                                {module.module_name}
                                                                            </label>
                                                                        </div>
                                                                        <div className="ms-4 mt-2">
                                                                            {module.features.map((feature, i) => (
                                                                                <div className="form-check d-flex" key={feature.id}>
                                                                                    <input className="form-check-input" type="checkbox"
                                                                                        checked={feature.status}
                                                                                        id={`flexcheck${module.module_id}-${feature.id}`}
                                                                                        disabled />
                                                                                    <label className="form-check-label ms-2" htmlFor={`flexcheck${module.module_id}-${feature.id}`}>
                                                                                        {feature.feature_name}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="row mt-4">
                                                                {rights.modules.map((module, index) => (
                                                                    <div className="col-lg-2 mb-3" key={module.module_id}>
                                                                        <div className="form-check d-flex">
                                                                            <input className="form-check-input" type="checkbox"
                                                                                id={`flexcheck${module.module_id}`}
                                                                                checked={handleAllCheck(module?.features)}
                                                                                onClick={() => { handleAll(module) }} />
                                                                            <label className="form-check-label ms-2 fw-bold" htmlFor={`flexcheck${module.module_id}`}>
                                                                                {module.module_name}
                                                                            </label>
                                                                        </div>
                                                                        <div className="ms-4 mt-2">
                                                                            {module.features.map((feature, i) => (
                                                                                <div className="form-check d-flex" key={feature.id}>
                                                                                    <input className="form-check-input" type="checkbox"
                                                                                        checked={feature.status}
                                                                                        id={`flexcheck${module.module_id}-${feature.id}`}
                                                                                        onClick={() => { handleSingle(feature, module) }} />
                                                                                    <label className="form-check-label ms-2" htmlFor={`flexcheck${module.module_id}-${feature.id}`}>
                                                                                        {feature.feature_name}
                                                                                    </label>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )
                                                    }
                                                </>

                                            ) : modulepermission?.view ? (
                                                <div className="row mt-4">
                                                    {rights.modules.map((module, index) => (
                                                        <div className="col-lg-2 mb-3" key={module.module_id}>
                                                            <div className="form-check d-flex">
                                                                <input className="form-check-input" type="checkbox"
                                                                    id={`flexcheck${module.module_id}`}

                                                                    disabled />
                                                                <label className="form-check-label ms-2 fw-bold" htmlFor={`flexcheck${module.module_id}`}>
                                                                    {module.module_name}
                                                                </label>
                                                            </div>
                                                            <div className="ms-4 mt-2">
                                                                {module.features.map((feature, i) => (
                                                                    <div className="form-check d-flex" key={feature.id}>
                                                                        <input className="form-check-input" type="checkbox"
                                                                            checked={feature.status}
                                                                            id={`flexcheck${module.module_id}-${feature.id}`}
                                                                            disabled />
                                                                        <label className="form-check-label ms-2" htmlFor={`flexcheck${module.module_id}-${feature.id}`}>
                                                                            {feature.feature_name}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </>}
                                    </div>

                                </div>
                            </div>

                        </div>
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

        </div >

    );

}

export default AccessRights