import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";




function SalaryStatementForm  ({ navigate }) {

  const schema = yup.object().shape({
    employeeName: yup.string().required("Employee Name is required"),
    employeeId: yup.string().required("Employee ID is required"),
    designation: yup.string().required("Designation is required"),
    department: yup.string().required("Department is required"),
  
    basicSalary: yup.number().positive("Basic Salary must be positive").required("Basic Salary is required"),
    hra: yup.number().min(0, "HRA must be non-negative").required("HRA is required"),
    salaryMonth: yup.string().required("Salary Month is required"),
  
    paymentMode: yup.string().required("Payment Mode is required"),
    bankAccountNumber: yup.string().when("paymentMode", {
      is: "Bank Transfer",
      then: (schema) => schema.required("Bank Account Number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  
    da: yup.number().min(0, "DA must be non-negative").required("DA is required"),
    otherAllowances: yup.number().min(0, "Other Allowances must be non-negative").required("Other Allowances are required"),
    deductions: yup.number().min(0, "Deductions must be non-negative").required("Deductions are required"),
    netSalary: yup.number().positive("Net Salary must be positive").required("Net Salary is required"),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const formValues = watch();
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    const hasValue = Object.values(formValues).some((val) => val && val !== "");
    setIsFormDirty(hasValue);
  }, [formValues]);

  const handleBackClick = () => {
    if (isFormDirty) {
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
          navigate("/financial/epf");
        }
      });
    } else {
      navigate("/financial/epf");
    }
  };

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Salary statement submitted successfully!");
  };

  return (
    <div className="card p-4 pt-2 shadow-sm">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
        <button className="btn" type="button" onClick={handleBackClick}>
          <i className="fa-solid fa-circle-left fs-5" />
        </button>
        <h6 className="fw-bold text-dark mb-0">Salary Statement Form</h6>
        <div />
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          {/* Employee Details */}
          <div className="col-md-4 mb-1">
            <label className="form-label">Employee Name</label>
            <input type="text" className="form-control" {...register("employeeName")} placeholder="Enter Employee Name" />
            <p className="text-danger">{errors.employeeName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Employee ID</label>
            <input type="text" className="form-control" {...register("employeeId")} placeholder="Enter Eployee Id" />
            <p className="text-danger">{errors.employeeId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Designation</label>
            <input type="text" className="form-control" {...register("designation")} placeholder="Enter Destination" />
            <p className="text-danger">{errors.designation?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Department</label>
            <input type="text" className="form-control" {...register("department")}  placeholder="Enter Department" />
            <p className="text-danger">{errors.department?.message}</p>
          </div>

          {/* Salary Details */}
          <div className="col-md-4 mb-1">
            <label className="form-label">Basic Salary</label>
            <input type="number" className="form-control" {...register("basicSalary")} placeholder="Enter Basic Salary" />
            <p className="text-danger">{errors.basicSalary?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">HRA</label>
            <input type="number" className="form-control" {...register("hra")} placeholder="Enter HRA" />
            <p className="text-danger">{errors.hra?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Salary Month</label>
            <input type="month" className="form-control" {...register("salaryMonth")} placeholder="Enter Salary Month" />
            <p className="text-danger">{errors.salaryMonth?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Mode</label>
            <select className="form-select" {...register("paymentMode")}>
              <option value="">Select Payment Mode</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
            <p className="text-danger">{errors.paymentMode?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Bank Account Number</label>
            <input type="text" className="form-control" {...register("bankAccountNumber")} placeholder="Enter Bank Account Number"/>
            <p className="text-danger">{errors.bankAccountNumber?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">DA (Dearness Allowance)</label>
            <input type="number" className="form-control" {...register("da")} placeholder="Enter Dearness Allowance" />
            <p className="text-danger">{errors.da?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Other Allowances</label>
            <input type="number" className="form-control" {...register("otherAllowances")} placeholder="Enter Other Allowance" />
            <p className="text-danger">{errors.otherAllowances?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Deductions (PF, Tax, etc.)</label>
            <input type="number" className="form-control" {...register("deductions")} placeholder="Enter deductions"/>
            <p className="text-danger">{errors.deductions?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Net Salary</label>
            <input type="number" className="form-control" {...register("netSalary")} placeholder="Enter Net Salary" />
            <p className="text-danger">{errors.netSalary?.message}</p>
          </div>

        </div>
        
        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>
    </div>
  );
};


function EpfChallan  ({ navigate })  {
  const schema = yup.object().shape({
    challanId: yup.string().required("Challan ID is required"),
    employeeName: yup.string().required("Employee Name is required"),
    employeeId: yup.string().required("Employee ID is required"),
    designation: yup.string().required("Designation is required"),
    department: yup.string().required("Department is required"),
    basicSalary: yup.number().positive("Salary must be positive").required("Basic Salary is required"),
    hra: yup.number().positive("HRA must be positive").required("HRA is required"),
    salaryMonth: yup.string().required("Salary Month is required"),
    paymentMode: yup.string().required("Payment Mode is required"),
    bankAccountNumber: yup.string().when('paymentMode', {
      is: 'Bank Transfer',
      then: yup.string().required('Bank Account Number is required')
    }),
    da: yup.number().positive("DA must be positive").required("DA is required"),
    otherAllowances: yup.number().positive("Other Allowances must be positive"),
    deductions: yup.number().positive("Deductions must be positive"),
    netSalary: yup.number().positive("Net Salary must be positive").required("Net Salary is required"),
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });

  const epfFormValues = watch();
  const [isEpfFormDirty, setIsEpfFormDirty] = useState(false);

  useEffect(() => {
    const hasValue = Object.values(epfFormValues).some((val) => val && val !== "");
    setIsEpfFormDirty(hasValue);
  }, [epfFormValues]);

  const epfHandleBackClick = () => {
    if (isEpfFormDirty) {
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
          navigate("/financial/epf");
        }
      });
    } else {
      navigate("/financial/epf");
    }
  };

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('EPF Challan form submitted successfully!');
  };

  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={epfHandleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add EPF Challan</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Challan ID</label>
            <input type="text" className="form-control" placeholder="Enter Challan ID" {...register("challanId")} />
            <p className="text-danger">{errors.challanId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Employee Name</label>
            <input type="text" className="form-control" placeholder="Enter Employee Name" {...register("employeeName")} />
            <p className="text-danger">{errors.employeeName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Employee ID</label>
            <input type="text" className="form-control" placeholder="Enter Employee ID" {...register("employeeId")} />
            <p className="text-danger">{errors.employeeId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Designation</label>
            <input type="text" className="form-control" placeholder="Enter Designation" {...register("designation")} />
            <p className="text-danger">{errors.designation?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Department</label>
            <input type="text" className="form-control" placeholder="Enter Department" {...register("department")} />
            <p className="text-danger">{errors.department?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Basic Salary</label>
            <input type="number" className="form-control" placeholder="Enter Basic Salary" {...register("basicSalary")} />
            <p className="text-danger">{errors.basicSalary?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">HRA (House Rent Allowance)</label>
            <input type="number" className="form-control" placeholder="Enter HRA" {...register("hra")} />
            <p className="text-danger">{errors.hra?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Salary Month</label>
            <input type="text" className="form-control" placeholder="Enter Salary Month" {...register("salaryMonth")} />
            <p className="text-danger">{errors.salaryMonth?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Mode</label>
            <select className="form-select" {...register("paymentMode")}>
              <option value="">Select Payment Mode</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
            </select>
            <p className="text-danger">{errors.paymentMode?.message}</p>
          </div>

          {watch("paymentMode") === "Bank Transfer" && (
            <div className="col-md-4 mb-1">
              <label className="form-label">Bank Account Number</label>
              <input type="text" className="form-control" placeholder="Enter Bank Account Number" {...register("bankAccountNumber")} />
              <p className="text-danger">{errors.bankAccountNumber?.message}</p>
            </div>
          )}

          <div className="col-md-4 mb-1">
            <label className="form-label">DA (Dearness Allowance)</label>
            <input type="number" className="form-control" placeholder="Enter DA" {...register("da")} />
            <p className="text-danger">{errors.da?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Other Allowances</label>
            <input type="number" className="form-control" placeholder="Enter Other Allowances" {...register("otherAllowances")} />
            <p className="text-danger">{errors.otherAllowances?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Deductions (PF, Tax, etc.)</label>
            <input type="number" className="form-control" placeholder="Enter Deductions" {...register("deductions")} />
            <p className="text-danger">{errors.deductions?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Net Salary</label>
            <input type="number" className="form-control" placeholder="Enter Net Salary" {...register("netSalary")} />
            <p className="text-danger">{errors.netSalary?.message}</p>
          </div>

        </div>

        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>
    </div>
  );
};

function PenaltyChallan ({ navigate }){
  const schema = yup.object().shape({
    challanId: yup.string().required("Challan ID is required"),
    penaltyAmount: yup.number().positive("Penalty amount must be positive").required("Penalty amount is required"),
    penaltyReason: yup.string().required("Penalty reason is required"),
    employeeId: yup.string().required("Employee ID is required"),
    employeeName: yup.string().required("Employee Name is required"),
    department: yup.string().required("Department is required"),
    issueDate: yup.date().required("Issue Date is required").max(new Date(), "Issue date cannot be in the future"),
    dueDate: yup.date().required("Due Date is required").min(yup.ref('issueDate'), "Due date must be after Issue date"),
    paymentStatus: yup.string().required("Payment status is required"),
    paymentMode: yup.string().when('paymentStatus', {
      is: 'Paid',
      then: yup.string().required("Payment Mode is required"),
    }),
    bankDetails: yup.string().when('paymentMode', {
      is: 'Bank Transfer',
      then: yup.string().required("Bank Details are required"),
    }),
    comments: yup.string().optional(),
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });

  const penaltyFormValues = watch();
  const [isPenaltyFormDirty, setIsPenaltyFormDirty] = useState(false);

  useEffect(() => {
    const hasValue = Object.values(penaltyFormValues).some((val) => val && val !== "");
    setIsPenaltyFormDirty(hasValue);
  }, [penaltyFormValues]);

  const penaltyHandleBackClick = () => {
    if (isPenaltyFormDirty) {
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
          navigate("/financial/epf");
        }
      });
    } else {
      navigate("/financial/epf");
    }
  };

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Penalty Challan form submitted successfully!');
  };

  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={penaltyHandleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add Penalty Challan</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Challan ID</label>
            <input type="text" className="form-control" placeholder="Enter Challan ID" {...register("challanId")} />
            <p className="text-danger">{errors.challanId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Penalty Amount</label>
            <input type="number" className="form-control" placeholder="Enter Penalty Amount" {...register("penaltyAmount")} />
            <p className="text-danger">{errors.penaltyAmount?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Penalty Reason</label>
            <input type="text" className="form-control" placeholder="Enter Penalty Reason" {...register("penaltyReason")} />
            <p className="text-danger">{errors.penaltyReason?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Employee ID</label>
            <input type="text" className="form-control" placeholder="Enter Employee ID" {...register("employeeId")} />
            <p className="text-danger">{errors.employeeId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Employee Name</label>
            <input type="text" className="form-control" placeholder="Enter Employee Name" {...register("employeeName")} />
            <p className="text-danger">{errors.employeeName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Department</label>
            <input type="text" className="form-control" placeholder="Enter Department" {...register("department")} />
            <p className="text-danger">{errors.department?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Issue Date</label>
            <input type="date" className="form-control" {...register("issueDate")} />
            <p className="text-danger">{errors.issueDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Due Date</label>
            <input type="date" className="form-control" {...register("dueDate")} />
            <p className="text-danger">{errors.dueDate?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Payment Status</label>
            <select className="form-select" {...register("paymentStatus")}>
              <option value="">Select Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <p className="text-danger">{errors.paymentStatus?.message}</p>
          </div>

          {watch("paymentStatus") === "Paid" && (
            <div className="col-md-4 mb-1">
              <label className="form-label">Payment Mode</label>
              <select className="form-select" {...register("paymentMode")}>
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
              <p className="text-danger">{errors.paymentMode?.message}</p>
            </div>
          )}

          {watch("paymentMode") === "Bank Transfer" && (
            <div className="col-md-4 mb-1">
              <label className="form-label">Bank Details</label>
              <input type="text" className="form-control" placeholder="Enter Bank Details" {...register("bankDetails")} />
              <p className="text-danger">{errors.bankDetails?.message}</p>
            </div>
          )}

          <div className="col-md-4 mb-1">
            <label className="form-label">Comments</label>
            <textarea className="form-control" placeholder="Enter any additional comments" {...register("comments")} />
            <p className="text-danger">{errors.comments?.message}</p>
          </div>

        </div>

        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>
    </div>
  );
};


function ECRStatement ({ navigate })  {
  const schema = yup.object().shape({
    employeeId: yup.string().required("Employee ID is required"),
    employeeName: yup.string().required("Employee Name is required"),
    department: yup.string().required("Department is required"),
    contributionType: yup.string().required("Contribution Type is required"),
    contributionAmount: yup
      .number()
      .positive("Contribution amount must be positive")
      .required("Contribution Amount is required"),
    ecrDate: yup
      .date()
      .required("Date is required")
      .max(new Date(), "Date cannot be in the future"),
  });

  const { register, handleSubmit, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });

  const ecrFormValues = watch();
  const [isECRFormDirty, setIsECRFormDirty] = useState(false);

  useEffect(() => {
    const hasValue = Object.values(ecrFormValues).some((val) => val && val !== "");
    setIsECRFormDirty(hasValue);
  }, [ecrFormValues]);

  const handleBackClick = () => {
    if (isECRFormDirty) {
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
          navigate("/financial/epf");
        }
      });
    } else {
      navigate("/financial/epf");
    }
  };

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("ECR Statement added successfully!");
  };

  return (
    <div className='card p-4 pt-2 shadow-sm'>
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Add ECR Statement</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row ms-1">

          <div className="col-md-4 mb-1">
            <label className="form-label">Employee ID</label>
            <input type="text" className="form-control" placeholder="Enter Employee ID" {...register("employeeId")} />
            <p className="text-danger">{errors.employeeId?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Employee Name</label>
            <input type="text" className="form-control" placeholder="Enter Employee Name" {...register("employeeName")} />
            <p className="text-danger">{errors.employeeName?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Department</label>
            <input type="text" className="form-control" placeholder="Enter Department" {...register("department")} />
            <p className="text-danger">{errors.department?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Contribution Type</label>
            <select className="form-select" {...register("contributionType")}>
              <option value="">Select Contribution Type</option>
              <option value="EPF">EPF</option>
              <option value="ESI">ESI</option>
              <option value="Gratuity">Gratuity</option>
            </select>
            <p className="text-danger">{errors.contributionType?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">Contribution Amount</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter Contribution Amount"
              {...register("contributionAmount")}
            />
            <p className="text-danger">{errors.contributionAmount?.message}</p>
          </div>

          <div className="col-md-4 mb-1">
            <label className="form-label">ECR Date</label>
            <input type="date" className="form-control" {...register("ecrDate")} />
            <p className="text-danger">{errors.ecrDate?.message}</p>
          </div>

        </div>

        <div className="text-center pt-3">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>
    </div>
  );
};

function PaymentConfirmation ({ navigate })  {
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
          navigate("/financial/epf");
        }
      });
    } else {
      navigate("/financial/epf");
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
        <h6 className="fw-bold text-dark mb-0">Add Payment Confirmation</h6>
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
};


function EpfAdd() {
  const location = useLocation();
  const formType = location.state?.name;

  console.log("formType",formType);
  

  const navigate = useNavigate();

  return (
   formType === 'Salary Statement' && <SalaryStatementForm navigate={navigate} /> || formType === 'Challan' && <EpfChallan navigate={navigate}/>
||formType === 'Penalty Challan' && <PenaltyChallan navigate={navigate} /> || formType === 'ECR Statement' && <ECRStatement navigate={navigate} />
|| formType ==='Payment Confirmation' && <PaymentConfirmation navigate={navigate} />

  )
}

export default EpfAdd