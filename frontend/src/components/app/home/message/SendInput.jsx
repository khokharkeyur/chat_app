import React, { useEffect, useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { GrAttachment } from "react-icons/gr";
import { MdClose } from "react-icons/md";
import axiosInterceptors from "../../axiosInterceptors";
import { useDispatch, useSelector } from "react-redux";
import {
  setEditMessage,
  setMessages,
  addUploadingFile,
  updateUploadingFile,
  removeUploadingFile,
  clearUploadingFiles,
} from "../../../../redux/messageSlice";
import { useSocket } from "../../../../config/SocketContext";
import toast from "react-hot-toast";

function SendInput({ mobileWidth }) {
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.user);
  const { messages, editMessage, uploadingFiles } = useSelector(
    (store) => store.message,
  );
  const socket = useSocket();

  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
  ];

  useEffect(() => {
    if (editMessage) {
      setMessage(editMessage.message);
    }
  }, [editMessage]);

  useEffect(() => {
    if (message === "" && selectedFiles.length === 0) {
      dispatch(setEditMessage(null));
      setMessage("");
    }
  }, [message, selectedFiles, dispatch]);

  const isGroup = selectedUser?.members;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    files.forEach((file) => {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        toast.error(`File type ${file.type} is not allowed`);
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} exceeds 25MB limit`);
        return;
      }

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
        progress: 0,
      });
    });

    setSelectedFiles([...selectedFiles, ...newFiles]);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(selectedFiles.filter((f) => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    selectedFiles.forEach((fileObj) => {
      formData.append("files", fileObj.file);
    });

    try {
      setUploading(true);

      // Upload files to backend
      const uploadResponse = await axiosInterceptors.post(
        "/message/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percentCompleted);
          },
        },
      );

      return uploadResponse.data.files;
    } catch (error) {
      toast.error("Failed to upload files");
      console.error("Upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate message or files
    if (!message.trim() && selectedFiles.length === 0) {
      toast.error("Please enter a message or select files");
      return;
    }

    try {
      let uploadedMedia = [];

      // Upload files if selected
      if (selectedFiles.length > 0) {
        setUploadProgress(0);
        dispatch(
          addUploadingFile({
            id: "batch",
            progress: 0,
            fileName: "Uploading attachments",
          }),
        );
        uploadedMedia = await uploadFiles();
        dispatch(removeUploadingFile("batch"));
      }

      const type = isGroup ? "group" : "user";

      if (editMessage) {
        // Can't edit messages with media, only text
        socket.emit("editMessage", editMessage._id, message);

        await axiosInterceptors.put(`/message/edit/${editMessage._id}`, {
          message,
        });
        dispatch(setEditMessage(null));
      } else {
        const payload = {
          message: message.trim() || null,
          type,
          media: uploadedMedia,
        };

        const res = await axiosInterceptors.post(
          `/message/send/${selectedUser?._id}`,
          payload,
        );

        dispatch(setMessages([...messages, res?.data?.newMessage]));
      }

      // Clear inputs
      setMessage("");
      setSelectedFiles([]);
      setUploadProgress(0);
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.error || "Failed to send message");
      setUploadProgress(0);
      dispatch(removeUploadingFile("batch"));
    }
  };

  return (
    <div>
      <form
        onSubmit={onSubmitHandler}
        className={`${mobileWidth ? "px-2" : "px-4"} my-3`}
      >
        {/* File Preview Section */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 rounded-3xl border border-white/10 bg-[#202c33] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
              <span>
                {selectedFiles.length} attachment
                {selectedFiles.length > 1 ? "s" : ""} ready
              </span>
              <span>{uploading ? `${uploadProgress}%` : "Ready to send"}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1">
              {selectedFiles.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111b21] p-2 flex items-center justify-center h-24"
                >
                  {fileObj.preview ? (
                    <img
                      src={fileObj.preview}
                      alt="preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="text-center text-xs text-slate-100 px-1">
                      <p className="truncate font-medium">
                        {fileObj.file.name}
                      </p>
                      <p className="text-slate-400">
                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(fileObj.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white backdrop-blur hover:bg-black/80"
                  >
                    <MdClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mb-3 rounded-3xl border border-[#25d366]/30 bg-[#111b21] p-3 text-sm text-slate-100 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366]/15 text-[#25d366] animate-pulse">
                  <GrAttachment size={16} />
                </span>
                <div>
                  <p className="font-medium leading-tight">
                    Sending attachments
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedFiles.length} file
                    {selectedFiles.length > 1 ? "s" : ""} in queue
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[#25d366]">
                {uploadProgress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#25d366] via-[#7ff29a] to-[#25d366] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="w-full relative">
          <div className="border text-sm rounded-lg block w-full p-3 border-zinc-500 bg-gray-600 text-white">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              type="text"
              placeholder="Send a message..."
              className={`${
                mobileWidth ? "w-[80%]" : "w-[92%]"
              } border-none bg-transparent focus:outline-none focus:border-none`}
              disabled={uploading}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov,.pdf,.doc,.docx,.xls,.xlsx,.zip"
              disabled={uploading}
            />
          </div>

          {/* Button Group */}
          <div className="absolute flex gap-2 inset-y-0 end-0 items-center pr-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-400 hover:text-white transition-colors"
              title="Attach files"
              disabled={uploading}
            >
              <GrAttachment size={20} />
            </button>
            <button
              type="submit"
              className="text-white hover:text-blue-400 transition-colors disabled:opacity-50"
              disabled={
                uploading || (!message.trim() && selectedFiles.length === 0)
              }
            >
              <IoSend size={20} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SendInput;
