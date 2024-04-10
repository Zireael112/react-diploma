import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFiles } from '../store/filesReducer';
import { FilesHandler } from '../components/FilesHandler';
import { DashBoard } from '../components/DashBoard';



export const UserStorage = () => {

  const dispatch = useDispatch();

  const [myFilesButtonState, setMyFilesButtonState] = useState(true);
  const [adminButtonState, setAdminButtonState] = useState(false);

  const handleMyFilesClick = () => {
    setMyFilesButtonState(true);
    setAdminButtonState(false);
  };

  const handleAdminClick = () => {
    setAdminButtonState(true);
    setMyFilesButtonState(false);
  };

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.files.loading);
  const error = useSelector((state) => state.files.error);

  
  useEffect(() => {
    dispatch(fetchFiles());
    
  }, [user, dispatch]);

  if(user.is_staff) {
    return (
      <>
      <div className="admin-panel" style={{ zIndex: 999 }}>
          <div className='admin-panel-title'><h3 data-text="Admin Panel">Admin Panel</h3></div>
          <button
            className="menu-btn my-files-btn"
            onClick={handleMyFilesClick}
            style={myFilesButtonState ? { backgroundColor: 'rgb(253, 5, 253)' } : null}
          >
            My files
          </button>
          <button
            className="menu-btn admin-dashboard-btn"
            onClick={handleAdminClick}
            style={adminButtonState ? { backgroundColor: 'rgb(253, 5, 253)', color: 'white' } : null}
          >
            Admin Dashboard
          </button>
        </div>
        {myFilesButtonState ? <FilesHandler /> : null}
        {adminButtonState ? <DashBoard /> : null}
      </>
    )
  }

  return <FilesHandler />;
};
