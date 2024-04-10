import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUsers,fetchAdminToggle, fetchDeleteUser, fetchInspectFiles, setInspectedUser, deleteInspectedUser } from '../store/adminReducer';

export const DashBoard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
  
    const users = useSelector((state) => state.admin.users);
    const loading = useSelector((state) => state.admin.loading);
    const error = useSelector((state) => state.admin.error);

    useEffect(() => {
      dispatch(fetchUsers());
    }, [dispatch]);

    const formatFileSize = (sizeInBytes) => {
      const sizeInMegabytes = sizeInBytes / (1024 * 1024); // 1 MB = 1024 KB = 1024 * 1024 bytes
      const formattedSize = sizeInMegabytes.toFixed(2); // Round to two decimal places
      return `${formattedSize} MB`;
    };

    const handleToggleAdmin = async (id, is_staff) => {
      try {
        await dispatch(fetchAdminToggle({userID: id, is_staff: is_staff}));
        await dispatch(fetchUsers());
      } catch (error) {
        console.error(error);
      }
    };

    const handleDeleteUser = async (id) => {
      try {
        console.log("Delete user with id:", id);
        await dispatch(fetchDeleteUser({userID:id}));
        await dispatch(fetchUsers());
      } catch (error) {
        console.error(error);
      }
    };

    const handleInspectUser = async (id) => {
      await dispatch(fetchInspectFiles(id));
      await dispatch(setInspectedUser(id));
      await navigate(`/inspect/${id}`);
    };

  
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard__content">
          <h2>Users of the application</h2>
          <table className="admin-dashboard__table">
            <thead>
              <tr className='admin-dashboard__table-user'>
                <th>Username</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Number of files</th>
                <th>Size of files</th>
                <th>Inspect</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <div className="preloader">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
              ) : null}
              {error ? (
                <tr>
                  <td>{error}</td>
                </tr>
              ) : users ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={user.is_staff}
                        onChange={() => handleToggleAdmin(user.id, !user.is_staff)}
                      />
                    </td>
                    <td>{user.num_files}</td>
                    <td>{formatFileSize(user.size_files)}</td>
                    <td>
                      <button className='menu-btn' onClick={() => handleInspectUser(user.id)} >Inspect</button>
                    </td>
                    <td>
                      <button className='menu-btn' onClick={() => handleDeleteUser(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>No users</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
