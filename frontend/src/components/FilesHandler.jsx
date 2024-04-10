/* eslint-disable no-unused-expressions */
import React, { useEffect, useState, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import {
  deleteFile,
  fetchFiles,
  updateFile,
  uploadFile,
} from "../store/filesReducer";
import { BASIC_URL } from "../settings/basic";
import ClipboardJS from "clipboard";
import { Spin, Table, Popconfirm, Form, Input } from "antd";
const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);

    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {}
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

export const FilesHandler = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const userFiles = useSelector((state) => state.files.files);
  const loading = useSelector((state) => state.files.loading);
  const error = useSelector((state) => state.files.error);
  const [dataSource, setDataSource] = useState([]);

  const [loaded, setLoaded] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [fileComment, setFileComment] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  const columns = [
    {
      title: "Название файла",
      dataIndex: "name",
      editable: true,
    },
    {
      title: "Комментарий",
      dataIndex: "comments",
      editable: true,
    },
    {
      title: "Размер файла",
      dataIndex: "size",
    },
    {
      title: "Дата загрузки файла",
      dataIndex: "date",
    },
    {
      title: "Операции",
      dataIndex: "Операции",
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <div style={{display: 'flex', gap: '1rem'}} className="file-operations">
            <Popconfirm
              title="Вы уверены?"
              onConfirm={() => handleDelete(record.key)}
            >
              <a>Удалить</a>
            </Popconfirm>
            <a onClick={(file) => handleFileSelect(file)}>Выделить</a>
            <a onClick={handleGenerateLink}>Скопировать ссылку</a>
            <a onClick={handleDownload}>Скачать</a>
          </div>
        ) : null,
    },
  ];

  useEffect(() => {
    if (error) return;
    Array.isArray(userFiles)
      ? setDataSource(
          userFiles.map((file) => {
            return {
              key: file.id,
              name: file.name,
              comments: file.comment,
              size: formatFileSize(file.size),
              date: format(new Date(file.upload_date), "dd/MM/yyyy HH:mm"),
            };
          })
        )
      : null;
  }, [userFiles]);

  const handleFileSelect = (file) => {
    const fileId = file.target.parentNode.parentNode.parentNode.getAttribute('data-row-key')
    const resultItem = [...userFiles].filter(item => item.id == fileId)
    setLoaded(true);
    setSelectedFile(resultItem);
    setNewFileName(resultItem.name);
  };

  const handleDelete = async (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    await dispatch(deleteFile({ fileID: selectedFile.id }));
    setSelectedFile(null);
    await dispatch(fetchFiles());
    setLoaded(false);
  };

  // const handleRename = async () => {
  //   await dispatch(
  //     updateFile({ fileID: selectedFile.id, message: { name: newFileName } })
  //   );
  //   setSelectedFile(null);
  //   await dispatch(fetchFiles());
  //   setLoaded(false);
  // };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("name", fileToUpload.name);
    formData.append("comment", fileComment);
    formData.append("user", user.username);

    await dispatch(uploadFile({ formData }));
    await dispatch(fetchFiles());
    setLoaded(false);
  };

  const handleDownload = () => {
    const fileUUID = selectedFile.uuid;

    const fileDownloadLink = `${BASIC_URL}/files/${fileUUID}/`;

    if (fileDownloadLink) {
      const link = document.createElement("a");

      link.href = fileDownloadLink;

      link.download = selectedFile.name;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
    }
    console.log('download link');
  };

  const handleGenerateLink = () => {
    const fileUUID = selectedFile.uuid;
    const link = `${BASIC_URL}/files/${fileUUID}/`;
    setGeneratedLink(link);
    console.log('generate link');
  };

  const onCopyLink = () => {
    window.alert("Link copied successfully!");
  };

  const handleCopyLink = () => {
    const clipboardInstance = new ClipboardJS(".copy-link-button", {
      text: () => generatedLink,
    });
    clipboardInstance.on("success", () => {
      onCopyLink();
      clipboardInstance.destroy();
    });
  };

  const formatFileSize = (sizeInBytes) => {
    const sizeInMegabytes = sizeInBytes / (1024 * 1024);
    const formattedSize = sizeInMegabytes.toFixed(2);
    return `${formattedSize} MB`;
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const tableColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  return (
    <div className="user__files">
      <Table
        rowClassName={() => "editable-row"}
        bordered
        columns={tableColumns}
        components={components}
        dataSource={dataSource}
      />

      <div className="file-upload">
        <h4>Загрузить файл</h4>
        <input
          className="file-input"
          type="file"
          onChange={(e) => {
            setFileToUpload(e.target.files[0]);
          }}
        />
        <input
          type="text"
          placeholder="Комментарий"
          value={fileComment}
          onChange={(e) => setFileComment(e.target.value)}
        />
        <button onClick={handleUpload}>Загрузить</button>
      </div>
    </div>
  );
};
