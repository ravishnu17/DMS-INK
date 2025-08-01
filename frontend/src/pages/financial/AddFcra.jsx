import React, { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Donation form
const FcraDonations = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors },watch, } = useForm({ resolver: yupResolver(schema) });

   const fcradonationFormValues = watch();
  const [isFcraDonationDirty, setIsFcraDonationDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(fcradonationFormValues).some((val) => val && val !== "");
      setIsFcraDonationDirty(hasValue);
    }, [fcradonationFormValues]);
  
    const fcradonationHandleBackClick = () => {
        // alert("call ..")
      if (isFcraDonationDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={fcradonationHandleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add FCRA Donations</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}

// Quarterly Abstracts form
const QuarterlyAbstract = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add Quarterly Abstracts </h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}

const QuarterlyBankStatements = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add Quarterly Bank Statements </h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}
const QuarterlyReturns = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add Quarterly Returns </h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}
const ChiefFunctionaryLetter = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0"> Add Chief Functionary Letter </h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}
const CACertificate = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add CA Certificate </h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}
const AnnualAuditStatement = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add Annual Audit Statement </h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}
const AnnualBankStatements = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add Annual Bank Statements</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}
const AnnualBankStatementUtilizationAccounts = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add Annual Bank Statement Utilization Accounts </h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}
const SignatureoftheChiefFunctionary = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add Signature of TheChief Functionary </h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}
const SealoftheAssociation = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0"> Add Seal of The Association</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}
const AnnualReturns = ({navigate}) => {
  const schema = yup.object().shape({
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, formState: { errors }, watch,} = useForm({ resolver: yupResolver(schema) });

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
    useEffect(() => {
      // Check if any form field has a value
      const hasValue = Object.values(formValues).some((val) => val && val !== "");
      setIsDirty(hasValue);
    }, [formValues]);
  
    const handleBackClick = () => {
      if (isDirty) {
        Swal.fire({
          // title: "Unsaved Changes!",
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/fcra");
          }
        });
      } else {
        navigate("/financial/fcra");
      }
    };
  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0"> Add Annual Returns </h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Purpose</label>
            <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
            <p className="text-danger">{errors.purpose?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Name of Donor</label>
            <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
            <p className="text-danger">{errors.donorName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Type</label>
            <select className="form-select" {...register("donorType")}>
              <option value="">Select donor type</option>
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
            <p className="text-danger">{errors.donorType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donation Received Date</label>
            <input type="date" className="form-control" {...register("donationDate")} />
            <p className="text-danger">{errors.donationDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Donor Country</label>
            <select className="form-select" {...register("donorCountry")}>
              <option value="">Select country</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="India">India</option>
            </select>
            <p className="text-danger">{errors.donorCountry?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Office</label>
            <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
            <p className="text-danger">{errors.office?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
            <p className="text-danger">{errors.email?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Website</label>
            <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
            <p className="text-danger">{errors.website?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col mb-2">
            <label className="form-label">Remark (if any)</label>
            <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
          </div>
        </div>
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>

    </div>
  )
}


function AddFcra() {
  const location = useLocation();
  const formType = location.state?.name;

  console.log("formType",formType);
  

  const navigate = useNavigate();
  return (
    formType === 'FCRA Donations' && <FcraDonations navigate={navigate}/> || formType === 'Quarterly Abstracts' && <QuarterlyAbstract navigate={navigate}   />
    || formType === 'Quarterly Bank Statements' && <QuarterlyBankStatements  navigate={navigate}/> || formType === 'Quarterly Returns' && <QuarterlyReturns navigate={navigate}  />
|| formType === 'Chief Functionary Letter' && <ChiefFunctionaryLetter navigate={navigate}/> || formType === 'CA Certificate' && <CACertificate navigate={navigate} />
|| formType === 'Annual Audit Statement'   && <AnnualAuditStatement navigate={navigate} /> || formType === 'Annual Bank Statements' && <AnnualBankStatements navigate={navigate} />
|| formType === 'Annual Bank Statement Utilization Accounts' && <AnnualBankStatementUtilizationAccounts navigate={navigate} /> || formType === 'Signature of the Chief Functionary' && <SignatureoftheChiefFunctionary navigate={navigate} />
|| formType === 'Seal of the Association' && <SealoftheAssociation navigate={navigate} /> || formType ==='Annual Returns' && <AnnualReturns navigate={navigate} />
  )
}

export default AddFcra