import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";

function ITRComputation({navigate}){

  const schema = yup.object().shape({
    paymentId: yup.string().required("Payment ID is required"),
    amount: yup
      .number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    paymentDate: yup
      .date()
      .required("Payment Date is required")
      .max(new Date(), "Date cannot be in the future"),
    paymentMethod: yup.string().required("Payment Method is required"),
    confirmationStatus: yup
      .boolean()
      .required("Confirmation Status is required"),
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });

  const paymentFormValues = watch();
  const [isPaymentFormDirty, setIsPaymentFormDirty] = useState(false);

  useEffect(() => {
    const hasValue = Object.values(paymentFormValues).some((val) => val && val !== "");
    setIsPaymentFormDirty(hasValue);
  }, [paymentFormValues]);

  const handleBackClick = () => {
    if (isPaymentFormDirty) {
      Swal.fire({
        text: "You have unsaved changes. Are you sure you want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Leave",
        cancelButtonText: "No, Stay",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/financial/itr");
        }
      });
    } else {
      navigate("/financial/itr");
    }
  };

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Payment Confirmation added successfully!");
  };

  return (
    <div className="card p-4 pt-2 shadow-sm">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
        <button className="btn" type="button" onClick={handleBackClick}>
          <i className="fa-solid fa-circle-left fs-5" />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add ITR Computation</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment ID</label>
            <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
            <p className="text-danger">{errors.paymentId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Date</label>
            <input type="date" className="form-control" {...register("paymentDate")} />
            <p className="text-danger">{errors.paymentDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Method</label>
            <select className="form-select" {...register("paymentMethod")}>
              <option value="">Select Payment Method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
            <p className="text-danger">{errors.paymentMethod?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Confirmation Status</label>
            <select className="form-select" {...register("confirmationStatus")}>
              <option value="">Select Confirmation Status</option>
              <option value={true}>Confirmed</option>
              <option value={false}>Not Confirmed</option>
            </select>
            <p className="text-danger">{errors.confirmationStatus?.message}</p>
          </div>

        </div>

        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>
    </div>
  );
}
function ITRVerification ({navigate}){

  const schema = yup.object().shape({
    paymentId: yup.string().required("Payment ID is required"),
    amount: yup
      .number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    paymentDate: yup
      .date()
      .required("Payment Date is required")
      .max(new Date(), "Date cannot be in the future"),
    paymentMethod: yup.string().required("Payment Method is required"),
    confirmationStatus: yup
      .boolean()
      .required("Confirmation Status is required"),
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });

  const paymentFormValues = watch();
  const [isPaymentFormDirty, setIsPaymentFormDirty] = useState(false);

  useEffect(() => {
    const hasValue = Object.values(paymentFormValues).some((val) => val && val !== "");
    setIsPaymentFormDirty(hasValue);
  }, [paymentFormValues]);

  const handleBackClick = () => {
    if (isPaymentFormDirty) {
      Swal.fire({
        text: "You have unsaved changes. Are you sure you want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Leave",
        cancelButtonText: "No, Stay",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/financial/itr");
        }
      });
    } else {
      navigate("/financial/itr");
    }
  };

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Payment Confirmation added successfully!");
  };

  return (
    <div className="card p-4 pt-2 shadow-sm">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
        <button className="btn" type="button" onClick={handleBackClick}>
          <i className="fa-solid fa-circle-left fs-5" />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add ITR - V (Verification)</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment ID</label>
            <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
            <p className="text-danger">{errors.paymentId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Date</label>
            <input type="date" className="form-control" {...register("paymentDate")} />
            <p className="text-danger">{errors.paymentDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Method</label>
            <select className="form-select" {...register("paymentMethod")}>
              <option value="">Select Payment Method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
            <p className="text-danger">{errors.paymentMethod?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Confirmation Status</label>
            <select className="form-select" {...register("confirmationStatus")}>
              <option value="">Select Confirmation Status</option>
              <option value={true}>Confirmed</option>
              <option value={false}>Not Confirmed</option>
            </select>
            <p className="text-danger">{errors.confirmationStatus?.message}</p>
          </div>

        </div>

        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>
    </div>
  );
}
function ITRFormVII ({navigate}){

  const schema = yup.object().shape({
    paymentId: yup.string().required("Payment ID is required"),
    amount: yup
      .number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    paymentDate: yup
      .date()
      .required("Payment Date is required")
      .max(new Date(), "Date cannot be in the future"),
    paymentMethod: yup.string().required("Payment Method is required"),
    confirmationStatus: yup
      .boolean()
      .required("Confirmation Status is required"),
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });

  const paymentFormValues = watch();
  const [isPaymentFormDirty, setIsPaymentFormDirty] = useState(false);

  useEffect(() => {
    const hasValue = Object.values(paymentFormValues).some((val) => val && val !== "");
    setIsPaymentFormDirty(hasValue);
  }, [paymentFormValues]);

  const handleBackClick = () => {
    if (isPaymentFormDirty) {
      Swal.fire({
        text: "You have unsaved changes. Are you sure you want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Leave",
        cancelButtonText: "No, Stay",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/financial/itr");
        }
      });
    } else {
      navigate("/financial/itr");
    }
  };

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Payment Confirmation added successfully!");
  };

  return (
    <div className="card p-4 pt-2 shadow-sm">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
        <button className="btn" type="button" onClick={handleBackClick}>
          <i className="fa-solid fa-circle-left fs-5" />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add ITR Form VII</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment ID</label>
            <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
            <p className="text-danger">{errors.paymentId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Date</label>
            <input type="date" className="form-control" {...register("paymentDate")} />
            <p className="text-danger">{errors.paymentDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Method</label>
            <select className="form-select" {...register("paymentMethod")}>
              <option value="">Select Payment Method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
            <p className="text-danger">{errors.paymentMethod?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Confirmation Status</label>
            <select className="form-select" {...register("confirmationStatus")}>
              <option value="">Select Confirmation Status</option>
              <option value={true}>Confirmed</option>
              <option value={false}>Not Confirmed</option>
            </select>
            <p className="text-danger">{errors.confirmationStatus?.message}</p>
          </div>

        </div>

        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>
    </div>
  );
}
function ITRForm10B ({navigate}){

  const schema = yup.object().shape({
    paymentId: yup.string().required("Payment ID is required"),
    amount: yup
      .number()
      .positive("Amount must be positive")
      .required("Amount is required"),
    paymentDate: yup
      .date()
      .required("Payment Date is required")
      .max(new Date(), "Date cannot be in the future"),
    paymentMethod: yup.string().required("Payment Method is required"),
    confirmationStatus: yup
      .boolean()
      .required("Confirmation Status is required"),
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });

  const paymentFormValues = watch();
  const [isPaymentFormDirty, setIsPaymentFormDirty] = useState(false);

  useEffect(() => {
    const hasValue = Object.values(paymentFormValues).some((val) => val && val !== "");
    setIsPaymentFormDirty(hasValue);
  }, [paymentFormValues]);

  const handleBackClick = () => {
    if (isPaymentFormDirty) {
      Swal.fire({
        text: "You have unsaved changes. Are you sure you want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Leave",
        cancelButtonText: "No, Stay",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/financial/itr");
        }
      });
    } else {
      navigate("/financial/itr");
    }
  };

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Payment Confirmation added successfully!");
  };

  return (
    <div className="card p-4 pt-2 shadow-sm">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
        <button className="btn" type="button" onClick={handleBackClick}>
          <i className="fa-solid fa-circle-left fs-5" />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add ITR Form 10B</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment ID</label>
            <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
            <p className="text-danger">{errors.paymentId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Amount</label>
            <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
            <p className="text-danger">{errors.amount?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Date</label>
            <input type="date" className="form-control" {...register("paymentDate")} />
            <p className="text-danger">{errors.paymentDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Method</label>
            <select className="form-select" {...register("paymentMethod")}>
              <option value="">Select Payment Method</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
            <p className="text-danger">{errors.paymentMethod?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Confirmation Status</label>
            <select className="form-select" {...register("confirmationStatus")}>
              <option value="">Select Confirmation Status</option>
              <option value={true}>Confirmed</option>
              <option value={false}>Not Confirmed</option>
            </select>
            <p className="text-danger">{errors.confirmationStatus?.message}</p>
          </div>

        </div>

        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>
    </div>
  );
}
function ITRForm9A ({navigate}){

    const schema = yup.object().shape({
      paymentId: yup.string().required("Payment ID is required"),
      amount: yup
        .number()
        .positive("Amount must be positive")
        .required("Amount is required"),
      paymentDate: yup
        .date()
        .required("Payment Date is required")
        .max(new Date(), "Date cannot be in the future"),
      paymentMethod: yup.string().required("Payment Method is required"),
      confirmationStatus: yup
        .boolean()
        .required("Confirmation Status is required"),
    });
  
    const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });
  
    const paymentFormValues = watch();
    const [isPaymentFormDirty, setIsPaymentFormDirty] = useState(false);
  
    useEffect(() => {
      const hasValue = Object.values(paymentFormValues).some((val) => val && val !== "");
      setIsPaymentFormDirty(hasValue);
    }, [paymentFormValues]);
  
    const handleBackClick = () => {
      if (isPaymentFormDirty) {
        Swal.fire({
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/itr");
          }
        });
      } else {
        navigate("/financial/itr");
      }
    };
  
    const onSubmit = (data) => {
      console.log("Form Submitted:", data);
      alert("Payment Confirmation added successfully!");
    };
  
    return (
      <div className="card p-4 pt-2 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
          <button className="btn" type="button" onClick={handleBackClick}>
            <i className="fa-solid fa-circle-left fs-5" />
          </button>
          <h6 className="fw-bold text-dark mb-0">ITR Form 9A</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row ms-1">
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment ID</label>
              <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
              <p className="text-danger">{errors.paymentId?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Amount</label>
              <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
              <p className="text-danger">{errors.amount?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment Date</label>
              <input type="date" className="form-control" {...register("paymentDate")} />
              <p className="text-danger">{errors.paymentDate?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment Method</label>
              <select className="form-select" {...register("paymentMethod")}>
                <option value="">Select Payment Method</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
              <p className="text-danger">{errors.paymentMethod?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Confirmation Status</label>
              <select className="form-select" {...register("confirmationStatus")}>
                <option value="">Select Confirmation Status</option>
                <option value={true}>Confirmed</option>
                <option value={false}>Not Confirmed</option>
              </select>
              <p className="text-danger">{errors.confirmationStatus?.message}</p>
            </div>
  
          </div>
  
          <div className="text-center pt-3">
            <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
          </div>
        </form>
      </div>
    );
  }
  function ITRForm10 ({navigate}){
  
    const schema = yup.object().shape({
      paymentId: yup.string().required("Payment ID is required"),
      amount: yup
        .number()
        .positive("Amount must be positive")
        .required("Amount is required"),
      paymentDate: yup
        .date()
        .required("Payment Date is required")
        .max(new Date(), "Date cannot be in the future"),
      paymentMethod: yup.string().required("Payment Method is required"),
      confirmationStatus: yup
        .boolean()
        .required("Confirmation Status is required"),
    });
  
    const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });
  
    const paymentFormValues = watch();
    const [isPaymentFormDirty, setIsPaymentFormDirty] = useState(false);
  
    useEffect(() => {
      const hasValue = Object.values(paymentFormValues).some((val) => val && val !== "");
      setIsPaymentFormDirty(hasValue);
    }, [paymentFormValues]);
  
    const handleBackClick = () => {
      if (isPaymentFormDirty) {
        Swal.fire({
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/itr");
          }
        });
      } else {
        navigate("/financial/itr");
      }
    };
  
    const onSubmit = (data) => {
      console.log("Form Submitted:", data);
      alert("Payment Confirmation added successfully!");
    };
  
    return (
      <div className="card p-4 pt-2 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
          <button className="btn" type="button" onClick={handleBackClick}>
            <i className="fa-solid fa-circle-left fs-5" />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add ITR Form 10</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row ms-1">
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment ID</label>
              <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
              <p className="text-danger">{errors.paymentId?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Amount</label>
              <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
              <p className="text-danger">{errors.amount?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment Date</label>
              <input type="date" className="form-control" {...register("paymentDate")} />
              <p className="text-danger">{errors.paymentDate?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment Method</label>
              <select className="form-select" {...register("paymentMethod")}>
                <option value="">Select Payment Method</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
              <p className="text-danger">{errors.paymentMethod?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Confirmation Status</label>
              <select className="form-select" {...register("confirmationStatus")}>
                <option value="">Select Confirmation Status</option>
                <option value={true}>Confirmed</option>
                <option value={false}>Not Confirmed</option>
              </select>
              <p className="text-danger">{errors.confirmationStatus?.message}</p>
            </div>
  
          </div>
  
          <div className="text-center pt-3">
            <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
          </div>
        </form>
      </div>
    );
  }
  function ITRFormVIIApproval ({navigate}){
  
    const schema = yup.object().shape({
      paymentId: yup.string().required("Payment ID is required"),
      amount: yup
        .number()
        .positive("Amount must be positive")
        .required("Amount is required"),
      paymentDate: yup
        .date()
        .required("Payment Date is required")
        .max(new Date(), "Date cannot be in the future"),
      paymentMethod: yup.string().required("Payment Method is required"),
      confirmationStatus: yup
        .boolean()
        .required("Confirmation Status is required"),
    });
  
    const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });
  
    const paymentFormValues = watch();
    const [isPaymentFormDirty, setIsPaymentFormDirty] = useState(false);
  
    useEffect(() => {
      const hasValue = Object.values(paymentFormValues).some((val) => val && val !== "");
      setIsPaymentFormDirty(hasValue);
    }, [paymentFormValues]);
  
    const handleBackClick = () => {
      if (isPaymentFormDirty) {
        Swal.fire({
          text: "You have unsaved changes. Are you sure you want to leave?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Yes, Leave",
          cancelButtonText: "No, Stay",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/financial/itr");
          }
        });
      } else {
        navigate("/financial/itr");
      }
    };
  
    const onSubmit = (data) => {
      console.log("Form Submitted:", data);
      alert("Payment Confirmation added successfully!");
    };
  
    return (
      <div className="card p-4 pt-2 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
          <button className="btn" type="button" onClick={handleBackClick}>
            <i className="fa-solid fa-circle-left fs-5" />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add ITR Form VII Approval</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row ms-1">
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment ID</label>
              <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
              <p className="text-danger">{errors.paymentId?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Amount</label>
              <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
              <p className="text-danger">{errors.amount?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment Date</label>
              <input type="date" className="form-control" {...register("paymentDate")} />
              <p className="text-danger">{errors.paymentDate?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment Method</label>
              <select className="form-select" {...register("paymentMethod")}>
                <option value="">Select Payment Method</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
              <p className="text-danger">{errors.paymentMethod?.message}</p>
            </div>
  
            <div className="col-md-4 mb-1">
              <label className="form-label">Confirmation Status</label>
              <select className="form-select" {...register("confirmationStatus")}>
                <option value="">Select Confirmation Status</option>
                <option value={true}>Confirmed</option>
                <option value={false}>Not Confirmed</option>
              </select>
              <p className="text-danger">{errors.confirmationStatus?.message}</p>
            </div>
  
          </div>
  
          <div className="text-center pt-3">
            <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
          </div>
        </form>
      </div>
    );
  }
function ITRAdd() {
     const navigate=useNavigate();
          const location = useLocation();
          const formType = location.state?.name;
        
          console.log("formType",formType);
  return (
   formType === 'ITR Computation' && <ITRComputation navigate={navigate} /> || formType === 'ITR - V (Verification)' && <ITRVerification navigate={navigate} />
    || formType === 'ITR Form VII' && <ITRFormVII navigate={navigate} /> || formType === 'ITR Form 10B' && <ITRForm10B navigate={navigate} />
   || formType === 'ITR Form 9A' && <ITRForm9A navigate={navigate} /> || formType === 'ITR Form 10' && <ITRForm10 navigate={navigate} />
   || formType === 'ITR Form VII Approval' && <ITRFormVIIApproval navigate={navigate} />
   
  )
}

export default ITRAdd