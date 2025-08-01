import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Dropzone from "react-dropzone";
import { addUpdateAPI, deleteAPI, getAPI } from "../../constant/apiServices";
import { useNavigate, useParams } from "react-router-dom";
import UserSelection from "./UserSelection";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

function Mail() {
  // Quill editor state
  const [message, setMessage] = useState("");

  // Get draftId from url params
  const { id: draftId } = useParams();
  //navigate
  const navigate = useNavigate();
  // State variables
  const [isDirty, setIsDirty] = useState(false); // <-- To track if the form has been modified
  const [existingFiles, setExistingFiles] = useState([]); // <-- Files from backend
  const [newFiles, setNewFiles] = useState([]); // <-- Files from dropzone
  const [selectAll, setSelectAll] = useState(false); // <-- To select all users in the user selection component
  const [selectedRecipients, setSelectedRecipients] = useState([]); // <-- Selected users
  const [isDraft, setIsDraft] = useState(false); // <-- To track if the email is a draft
  const [initialMessage, setInitialMessage] = useState(""); // <-- Initial message content
  const [selectUser, setSelectUser] = useState(false); // <-- To track if the user selection component should be shown
  const [sending, setSending] = useState(false); // <-- To track loading state during API calls or other async operations


  /**
   * Strip HTML tags from a given string of HTML.
   * @param {string} html
   * @returns {string} The given string with HTML tags removed.
   */
  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Define validation schema using yup
  const emailSchema = yup.object().shape({
    subject: yup.string().required("Subject is required"), // Subject field validation
    message: yup.string().test('is-empty', "Message is required", (value) => {
      const plainText = stripHtml(value || '').trim();
      return plainText.length > 0;
    }), // Message field validation
    recipients:
      draftId || isDraft
        ? yup.array() // No minimum requirement if draftId or isDraft is true
        : yup.array().min(1, "Please select at least one recipient"), // Require at least one recipient otherwise
  });

  // Initialize react-hook-form with validation resolver
  const {
    register, // Register function for form fields
    handleSubmit, // Function to handle form submission
    reset, // Function to reset form fields
    formState: { errors }, // Object containing form errors
    watch, // Function to watch form values
    setValue, // Function to set form values
    clearErrors, // Function to clear form errors
  } = useForm({
    resolver: yupResolver(emailSchema), // Use yup resolver for validation
    context: {
      selectedRecipients, // Pass selected recipients as context
    },
  });

  const formValues = watch(); // Watch form values for changes
  const token = sessionStorage.getItem("token"); // Retrieve token from session storage

  /**
   * Resets the form to its initial state.
   * Clears the following:
   *   - newFiles (files from dropzone)
   *   - existingFiles (files from backend)
   *   - selectedRecipients (selected users)
   *   - isDraft (tracks if the email is a draft)
   *   - Message content
   *   - React-hook-form values (subject, recipients, message)
   */
  const clearAll = () => {
    setNewFiles([]);
    setExistingFiles([]);
    setSelectedRecipients([]);
    setIsDraft(false);
    setMessage("");
    setTimeout(() => {
      reset({ subject: "", recipients: [], message: "" });
    }, 50);
  };

  /**
   * Fetches all users from the backend using pagination.
   * @async
   * @returns {Promise<Array<Object>>} An array of user objects.
   */
  const fetchAllUsers = async () => {
    let users = [];
    let resp;
    do {
      resp = await getAPI(`/access/users-options`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      users = users.concat(resp.data?.data);
    } while (resp.data.next);
    return users;
  };

  /**
   * Fetches a draft email from the backend given its ID and pre-populates the
   * form with the fetched data.
   * @async
   * @param {number} draftId - The ID of the draft email to fetch.
   * @returns {Promise<void>}
   */
  const getDraft = async (draftId) => {
    try {
      const response = await getAPI(
        `/communication/communications/${draftId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const draft = response.data;

      setExistingFiles(draft.attachments || []);
      reset({
        subject: draft.subject,
        message: draft.content,
      });
      if (draft.content) {
        setInitialMessage(draft.content);
        setMessage(draft.content);
      }
      const selected = draft.recipients.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
      }));
      setSelectedRecipients(selected);
      setValue("recipients", selected, { shouldValidate: true });

    } catch (error) {
      console.error("Error fetching draft:", error);
    }
  };

  /**
   * Updates a draft email with the latest form data.
   * If `isDraftFlag` is true, the email is saved as a draft.
   * If `isDraftFlag` is false, the email is sent.
   * @async
   * @param {number} draftId - The ID of the draft email to update.
   * @param {boolean} isDraftFlag - Whether to save as draft or send.
   * @returns {Promise<void>}
   */
  const updateDraft = async (draftId, isDraftFlag) => {
    setSending(true);
    const content = message;
    const formData = new FormData();

    const communication = {
      subject: formValues.subject,
      content,
      type: "mail",
      status: isDraftFlag ? "DRAFT" : "SENT",
      recipients: selectedRecipients.map((recipient) => ({
        id: recipient.id,
        email: recipient.email,
      })),
    };

    formData.append("communication", JSON.stringify(communication));
    newFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await addUpdateAPI(
        "PUT",
        "communication/communication_update/" + draftId,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        setSending(false);
        //success
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: "success",
          text: isDraftFlag ? "Email saved as draft successfully" : "Email sent successfully",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: ' #28a745',
          color: '  #ffff'
        });
        isDraftFlag && getDraft(draftId);
        setNewFiles([]);
        if (!isDraftFlag) {
          clearAll();
          navigate("/communication/email/compose-mail", { replace: true });
        }
      } else {
        setSending(false);
        Swal.fire({
          icon: "warning",
          title: 'Something went wrong!',
          text: response.data.details || 'Something went wrong!',
          confirmButtonText: 'OK',
          background: 'rgb(255, 255, 255)',
          color: '  #000000'
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      setSending(false);
      Swal.fire({
        icon: "warning",
        title: 'Something went wrong!',
        text: "Try again",
        confirmButtonText: 'OK',
        background: 'rgb(255, 255, 255)',
        color: '  #000000'
      });
    }
  };
  /**
   * Submits the email form data to the backend to create a new communication.
   * If `isDraft` is true, the email is saved as a draft.
   * If `isDraft` is false, the email is sent.
   * @async
   * @param {Object} data - The form data, which includes the subject of the email.
   * @returns {Promise<void>}
   */
  const onSubmit = async (data) => {
    setSending(true);
    const content = message;
    const formData = new FormData();

    const communication = {
      subject: data.subject,
      content,
      type: "mail",
      status: isDraft ? "DRAFT" : "SENT",
      recipients: selectedRecipients.map((recipient) => ({
        id: recipient.id,
        email: recipient.email,
      })),
    };
    setValue("recipients", selectedRecipients, { shouldValidate: true });
    formData.append("communication", JSON.stringify(communication));
    newFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await addUpdateAPI(
        "POST",
        "communication/create_communication",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        //success
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: "success",
          text: isDraft
            ? "Email saved as draft successfully"
            : "Email sent successfully",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: ' #28a745',
          color: '  #ffff'
        });
        clearAll();
        clearErrors("message");
      } else {
        Swal.fire({
          icon: "warning",
          title: 'Something went wrong!',
          text: "Try again",
          confirmButtonText: 'OK',
          background: 'rgb(255, 255, 255)',
          color: '  #000000'
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      Swal.fire({
        icon: "warning",
        title: 'Something went wrong!',
        text: "Try again",
        confirmButtonText: 'OK',
        background: 'rgb(255, 255, 255)',
        color: '  #000000'
      });
    } finally {
      setSending(false);
    }
  };

  /**
   * Handles the file drop event, adding accepted files to the current list of new files.
   * Ensures that the total number of files does not exceed the maximum limit of 5.
   * Alerts the user if the limit is exceeded.
   *
   * @param {File[]} acceptedFiles - Array of files that were dropped and accepted for processing.
   */

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length + newFiles.length + existingFiles.length > 5) {
      alert("You can only upload a maximum of 5 files.");
      return;
    }
    setNewFiles([...newFiles, ...acceptedFiles]);
  };

  /**
   * Returns the font awesome icon for a given file type.
   *
   * @param {string} type - The MIME type of the file.
   * @returns {string} The font awesome icon class for the file type.
   */
  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      case "application/pdf":
        return "fa-solid fa-file-pdf";
      case "text/csv":
        return "fa-solid fa-file-csv";
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "fa-solid fa-file-word";
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return "fa-solid fa-file-excel";
      default:
        return "fa-solid fa-file";
    }
  };

  /**
   * Handles the back button click event.
   * If the form data is dirty and the email is not a draft, a confirmation dialog is shown to the user.
   * If the user confirms, the form data is reset and the previous page is navigated to.
   * If the form data is not dirty or the email is a draft, the previous page is navigated to without any confirmation dialog.
   */
  const handleBackClick = () => {
    if (isDirty && !isDraft) {
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
          window.history.back();
          reset();
        }
      });
    } else {
      window.history.back();
    }
  };
  /**
   * Removes an existing file from the email draft.
   * Shows a confirmation dialog to the user before deleting the file.
   * If the user confirms, the file is deleted and the existing files list is updated.
   * If the user cancels, the action is aborted.
   *
   * @param {number} fileId - The id of the file to be removed.
   */
  const RemoveExistingFile = (fileId) => {
    Swal.fire({
      text: "Are you sure you want to remove the file?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "No, Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAPI(
          `communication/communication_attachment_delete/${fileId}`
        ).then((response) => {
          if (response.data.status) {
            //success
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: "Removed",
              text: "File removed successfully",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: ' #28a745',
              color: '  #ffff'
            });
            const newExistingFiles = existingFiles.filter(
              (file) => file.id !== fileId
            );
            setExistingFiles(newExistingFiles);
          } else {
            Swal.fire({
              icon: "warning",
              title: 'Something went wrong!',
              text: "Try again",
              confirmButtonText: 'OK',
              background: 'rgb(255, 255, 255)',
              color: '  #000000'
            });
          }
        });
      }
    });
  };

  /**
   * Handles the change event of the select all checkbox.
   * If the checkbox is checked, all users are fetched and set as the selected recipients.
   * If the checkbox is unchecked, the selected recipients are cleared.
   * @param {boolean} checked - Whether the checkbox is checked or not.
   */
  const handleSelectAllChange = async (checked) => {
    setSelectAll(checked);
    if (checked) {
      const users = await fetchAllUsers();


      setSelectedRecipients(users);
      setValue("recipients", users, { shouldValidate: true });
    } else {
      setSelectedRecipients([]);
      setValue("recipients", [], { shouldValidate: true });
    }
  };
  /**
   * Updates the list of selected recipients in the email form.
   * Sets the selected recipients state and updates the form's recipients field.
   *
   * @param {Array} recipients - The array of recipients to be set as selected.
   */

  const handleRecipientSelection = (recipients) => {
    setSelectedRecipients(recipients);
    setValue("recipients", recipients, { shouldValidate: true });
  };

  // Set the dirty state based on form values
  useEffect(() => {
    const isEmpty =
      formValues.subject === "" &&
      formValues.message === "" &&
      Array.isArray(formValues.recipients) &&
      formValues.recipients.length === 0;

    setIsDirty(!isEmpty);
    console.log(formValues, "vallll");
  }, [formValues]);

  // Fetch the draft email when draftId is available
  useEffect(() => {
    if (draftId) getDraft(draftId);
  }, [draftId]);

  // Update form message value when message changes
  useEffect(() => {

  }, [message]);

  return (
    <div className="card p-4 pt-2 shadow">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
        <button className="btn" type="button">
          <i
            className="fa-solid fa-circle-left fs-5"
            onClick={handleBackClick}
          />
        </button>
        <h6 className="fw-bold text-dark mb-0">Email Communication</h6>
        <div />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-md-7 mb-3">
            <div className="mb-3">
              <label className="form-label">
                Subject <span className="text-danger fw-bold">*</span>
              </label>
              <input
                {...register("subject")}
                className={`form-control }`}
                placeholder="Enter subject"
              />
              <div className="text-danger" style={{ fontSize: "0.8rem" }}>
                {errors.subject?.message}
              </div>
            </div>
            <div className="mb-2">
              <input type="hidden" {...register("message")} />
              <label className="form-label">
                Message <span className="text-danger fw-bold">*</span>
              </label>
              <ReactQuill
                theme="snow"
                value={message}
                onChange={(value) => {
                  console.log(value);

                  setMessage(value);
                  setValue("message", value, { shouldValidate: true });
                }}
                placeholder="Compose a message"
                style={{ height: "200px", marginBottom: "40px" }}
              />
              {errors.message && (
                <div className="text-danger" style={{ fontSize: "0.8rem" }}>
                  {errors.message.message}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-5 mb-3">
            <label className="form-label">Attach Files</label>
            <Dropzone
              onDrop={onDrop}
              accept={{
                "application/pdf": [".pdf"],
                "application/vnd.ms-excel": [".xls"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [".xlsx"],
                "text/csv": [".csv"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              maxFiles={5}
              maxSize={5 * 1024 * 1024}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps({ className: "dropzone-container" })}>
                  <input {...getInputProps()} />
                  <p className="text-muted">
                    Drag & drop files here, or click to select files.
                  </p>
                  <small className="text-secondary">
                    Allowed formats: PDF, Excel, CSV, JPEG, PNG | Max: 5 files,
                    5MB each
                  </small>
                </div>
              )}
            </Dropzone>

            <div className="ms-3 mt-2">
              <ul className="list-group">
                {existingFiles.map((file) => (
                  <li
                    key={`existing-${file.id}`}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>
                      <i className="fa-solid fa-file text-secondary me-2" />
                      &nbsp;{" "}
                      {file?.filename?.length > 30
                        ? file?.filename?.slice(0, 20) + "..."
                        : file?.filename}
                      {file?.filename?.split(".").pop()
                        ? "." + file?.filename?.split(".").pop()
                        : ""}{" "}
                      <span className="badge bg-light text-dark ms-2">
                        Existing
                      </span>
                    </span>
                    <i
                      className="fa-solid fa-circle-xmark text-danger"
                      onClick={() => RemoveExistingFile(file.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </li>
                ))}
                {newFiles.map((file, index) => (
                  <li
                    key={`new-${index}`}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>
                      <i
                        className={
                          getFileIcon(file?.type) + " text-primary me-2"
                        }
                      />
                      &nbsp;{" "}
                      {file?.name?.length > 30
                        ? file?.name?.slice(0, 20) + "..."
                        : file?.name}
                      {file?.name?.split(".").pop()
                        ? "." + file?.name?.split(".").pop()
                        : ""}{" "}
                      {/* ({(file?.size / 1024).toFixed(2)} KB) */}
                      <span className="badge bg-success text-white ms-2">
                        New
                      </span>
                    </span>
                    <i
                      className="fa-solid fa-circle-xmark text-danger"
                      onClick={() =>
                        setNewFiles(newFiles.filter((_, i) => i !== index))
                      }
                      style={{ cursor: "pointer" }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="col-md-7 ">
            <div className="row justify-content-start">
              <div className="col-md-12">
                <select
                  multiple
                  hidden
                  {...register("recipients")}
                  value={selectedRecipients.map((r) => r?.id)}
                />
                <label className="form-label">
                  Select Email Recipients{" "}
                  <span className="text-danger fw-bold">*</span>
                </label>
                <div className="d-flex gap-3 align-items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                  />{" "}
                  Select All
                  <button
                    type="button"
                    className="btn btn-sm btn-primary px-4"
                    onClick={() => {
                      setSelectUser(!selectUser);
                      // popup for user selection
                    }}
                  >
                    Select Users
                  </button>
                </div>
                {errors?.recipients && (
                  <div className="text-danger" style={{ fontSize: "0.8rem" }}>
                    {errors?.recipients?.message}
                  </div>
                )}
                <div className="w-100"></div>
              </div>
            </div>
            {selectedRecipients.length > 0 && (
              <div
                className=" mt-3 border shadow-md overflow-auto"
                style={{ maxHeight: "200px" }}
              >
                <table className="table ">
                  <thead style={{ position: "sticky", top: 0 }}>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecipients?.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{row?.name}</td>
                        <td>{row?.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-3 d-flex gap-3 justify-content-center">
          <button
            type={!draftId ? "submit" : "button"}
            className="btn btn-sm btn-success px-4"
            onClick={() => {
              if (draftId) {
                updateDraft(draftId, false);
              }
              setIsDraft(false);
              // Disable button and show loading indicator if sending
            }}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
          <button
            type={!draftId ? "submit" : "button"}
            disabled={sending}
            className="btn btn-sm btn-secondary px-4"
            onClick={() => {
              if (draftId) {
                updateDraft(draftId, true);
              }
              setIsDraft(true);
            }}
          >
            Save Draft
          </button>
        </div>
      </form>
      {selectUser && (
        <UserSelection
          setSelectAll={setSelectAll}
          selectedRecipients={selectedRecipients}
          setSelectUser={setSelectUser}
          handleRecipientSelection={handleRecipientSelection}
        />
      )}
    </div>
  );
}

export default Mail;