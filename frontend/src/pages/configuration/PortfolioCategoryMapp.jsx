import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import { axiosInstance } from "../../constant/axiosInstance";
import Swal from "sweetalert2";
import { addUpdateAPI, getAPI } from "../../constant/apiServices";


function PortfolioCategoryMapp() {
    const location = useLocation();
    const selectedRow = location?.state?.data;

    const navigate = useNavigate();
    // Validation Schema

    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const getPortfolioCategoryMapp = async () => {
        axiosInstance(`/category/mapp/${selectedRow?.id}?skip=0&limit=0`).then((res) => {
            if (res?.data.status) {
                setSelectedCategories(res?.data?.data?.map((item) => item.category_id));
            } else {
                setSelectedCategories([])
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    const getCategories = async () => {
        getAPI("/category/?skip=0&limit=0").then((res) => {
            if (res?.data.status) {
                setCategories(res?.data?.data);
            } else {
                setCategories([])
            }
        }).catch((err) => {
            console.log(err);
        })
    };

    const handleCategoryChange = (id) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter((item) => item !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const onSubmit = () => {
        if (selectedCategories.length === 0) {
            Swal.fire({
                title: 'Select at least one category',
                icon: 'warning',
                toast: true,
                showConfirmButton: false,
                timer: 1500
            })
            return;
        }

        addUpdateAPI("POST", `/category/mapp?portfolio_id=${selectedRow?.id}`, selectedCategories).then((res) => {
            if (res?.data?.status) {
                //success
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Success',
                    text: 'Mapping has been updated successfully',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: ' #28a745',
                    color: '  #ffff'
                });

                navigate("/config/portfolioCategory")
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
        }).catch((err) => {
            console.log(err);
        })
    }

    useEffect(() => {
        getPortfolioCategoryMapp();
        getCategories();
        // if (selectedRow) {
        //     reset({ portfolio_id: { value: selectedRow.portfolio?.id, label: selectedRow.portfolio?.name } });
        //     setSelectedCategories([1, 3, 6]);
        // }
    }, [])

    return (
        <div className="card p-4 pt-2 shadow">
            <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
                <button className='btn' type='button' onClick={() => navigate("/config/portfolioCategory")}>
                    <i className='fa-solid fa-circle-left fs-5' />
                </button>
                <h6 className="fw-bold text-dark mb-0">Portfolio Category Mapping</h6>
                <div />
            </div>
            <div>
                <div className="row mb-2">
                    <div className="col-md-6">
                        <label className="form-label">Portfolio</label>
                        <h6 className="ms-2 fw-bold">{selectedRow?.name}</h6>
                        {/* <Controller
                            name="portfolio_id"
                            control={control}
                            render={({ field }) => (
                                <Select {...field} placeholder="Select Portfolio" options={portfolios.map((item) => ({ value: item.id, label: item.name }))} />
                            )}
                        />
                        <p className="text-danger">{errors?.portfolio_id?.message}</p> */}
                    </div>
                </div>
                <div className="row p-2">
                    {
                        categories.map((item, index) => (
                            <div className="col-4 form-check d-flex py-2" key={index}>
                                <input className="form-check-input p-2 border-secondary" type="checkbox" id={`flexcheck${index}`} checked={selectedCategories.includes(item.id)} onChange={() => handleCategoryChange(item.id)} />
                                <label className="form-check-label ms-2" htmlFor={`flexcheck${index}`}>{item?.name}</label>
                            </div>
                        ))
                    }
                </div>
                <div className="d-flex justify-content-end">
                    <button type="button" onClick={onSubmit} className="btn btn-primary btn-sm px-4 adminBtn">Save</button>
                </div>
            </div>
        </div>
    );
}

export default PortfolioCategoryMapp;
