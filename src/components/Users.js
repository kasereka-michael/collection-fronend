import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import Pagination from './common/Pagination';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('ALL');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let response;
      if (filterRole === 'ALL') {
        response = await userService.getAllUsers({ page, size });
      } else {
        response = await userService.getUsersByRole(filterRole, { page, size });
      }

      // Expect Spring Page response: { content, totalPages, totalElements, number, size }
      const data = response.data;
      const items = Array.isArray(data) ? data : data?.content ?? [];
      setUsers(items);
      setTotalPages(data?.totalPages ?? (Array.isArray(data) ? 1 : 0));
      setTotalElements(data?.totalElements ?? items.length);
      if (typeof data?.number === 'number') setPage(data.number);
      if (typeof data?.size === 'number') setSize(data.size);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRole, page, size]);

  const handleActivateDeactivate = async (userId, isActive) => {
    try {
      if (isActive) {
        await userService.deactivateUser(userId);
      } else {
        await userService.activateUser(userId);
      }
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>User Management</h1>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/users/new')}
            >
              <i className="fas fa-plus me-2"></i>
              Add New User
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="row">
                <div className="col-md-6">
                  <h5>All Users</h5>
                </div>
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={filterRole}
                    onChange={(e) => { setFilterRole(e.target.value); setPage(0); }}
                  >
                    <option value="ALL">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="COLLECTOR">Collector</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Username</th>
                          <th>Full Name</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => user.username.toLowerCase() === "admin" ? null : ( 
                            <tr key={user.id}>
                              <td>{user.id}</td>
                              <td>{user.username}</td>
                              <td>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</td>
                              <td>
                                <span className={`badge ${
                                  user.role === 'ADMIN' ? 'bg-danger' : 
                                  user.role === 'ACCOUNTANT' ? 'bg-warning' : 
                                  'bg-info'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-info me-2"
                                  onClick={() => navigate(`/users/${user.id}`)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-warning me-2"
                                  onClick={() => navigate(`/users/${user.id}/edit`)}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className={`btn btn-sm me-2 ${user.isActive ? 'btn-secondary' : 'btn-success'}`}
                                  onClick={() => handleActivateDeactivate(user.id, user.isActive)}
                                >
                                  <i className={`fas ${user.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(user.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3">
                    <Pagination
                      page={page}
                      size={size}
                      totalPages={totalPages}
                      totalElements={totalElements}
                      onPageChange={setPage}
                      onSizeChange={(newSize) => { setSize(newSize); setPage(0); }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
