import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useLocation, useNavigate } from "react-router-dom";
import { yupResolver } from '@hookform/resolvers/yup';
import { getRoles } from "../services/roleService";
import { addEmployee, deleteCurrentEmployee, editEmployee } from '../services/employeesService';
import { Modal } from 'react-bootstrap';
import * as yup from 'yup';
// import { Button } from '@mui/material';
// import Box from '@mui/joy/Box';
// // import { Checkbox } from '@mui/joy';
// import Option from '@mui/joy/Option';
// import Stack from '@mui/joy/Stack';
// import { ArrowDropDown } from '@mui/icons-material';
//brachi
import { Select, Button, Icon, Confirm, Container, Form, FormField, FormGroup, Header, Input, Segment, Checkbox } from "semantic-ui-react";
import * as sctionType from '../store/action'
import Swal from "sweetalert2";
import swalWithBootstrapButtons from "sweetalert2";
import dayjs from "dayjs";

// import { moment } from "moment";


const schema = yup.object().shape({
  firstName: yup.string().required('This field is required'),
  lastName: yup.string().required('This field is required'),
  tz: yup.number().integer('').positive('').required('This field is required'),
  startDate: yup.date().required('This field is required'),
  birthDate: yup.date().required('This field is required'),
  gender: yup.number().required('This field is required'),
  roles: yup.array().of(
    yup.object().shape({
      roleId: yup.number().required('This field is required'),
      isAdministrative: yup.boolean().required('This field is required'),
      startDate: yup.date().required('This field is required'),
    }).required(),
  ),
});

const gender = [
  { key: '0', value: '0', text: 'Male' },
  { key: '1', value: '1', text: 'Female' },
]
export const SelectGender = () => (
  <Select placeholder='Select your gender' options={gender} />
)
export const SelectRoles = () => {
  const roles = useSelector(state => state.roles.roles)
  const employee = useSelector(state => state.employees.employee)
  const [d, setD] = useState([])
  useEffect(() => {
    // מילוי מערך d עם נתונים מ-roles
    setD(roles.map(role => ({ key: role.id, value: role.id, text: role.name })));
  }, [roles]);
  return (
    <>
      <Select placeholder='Select your role' options={d} />
    </>
  );
}
// roles?.map((x, i) => {
//   <div key={i}>
//     d.append({value= x.roleId, text= x.name})
//   </div>
// })
// {
//   roles?.map((x, i) =>
//     <option key={i} value={x.Id}
//       selected={employee && x.Id == employee.CategoryId}>
//       {x.Name}
//     </option>)
// }

const AddEditEmployee = () => {

  const employee = useSelector(state => state.employees.employee)
  const employeeId = useSelector(state => state.employees.employee?.id)
  const roles = useSelector(state => state.roles.roles)

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [showConfirm, setShowConsfirm] = useState(false);

  useEffect(() => {
    dispatch(getRoles())
  }, [roles])

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const { fields, append, remove } = useFieldArray({
    control, name: "roles"
  });

  useEffect(() => {
    if (location.pathname == '/addEmployee') {
      document.title = 'Add Employee'
    }
    else {
      document.title = 'Edit Employee'
    }
  }, [location])

  const onSubmit = data => {
    console.log("onSubmit: data - ", data);
    if (data) {
      const { ...rest } = data;
      const employee = {
        ...rest,
        isActive: true,
      }
      if (location.pathname == '/addEmployee') {
        Swal.fire({
          title: "Are you sure?",
          text: "You will have the option to edit the details again",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, add it!"
        }).then((result) => {
          if (result.isConfirmed) {
            dispatch(addEmployee(employee));
            navigate('/employees')
          }
          else if (
            result.dismiss === Swal.DismissReason.cancel
          ) {
            swalWithBootstrapButtons.fire({
              title: "Cancelled",
              text: "The employee's details have not yet been saved",
              icon: "error"
            });
          }
        })
      }
      else {
        Swal.fire({
          title: "Are you sure?",
          text: "You will have the option to edit the details again",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, update it!"
        }).then((result) => {
          if (result.isConfirmed)
            dispatch(editEmployee(employee, employeeId));
          else if (
            result.dismiss === Swal.DismissReason.cancel
          ) {
            swalWithBootstrapButtons.fire({
              title: "Cancelled",
              text: "The employee's details have not yet been updated",
              icon: "error"
            });
          }
        })

      }
    }
  };

  return (
    <>
      <br />
      <Container text>
        {employee && <Header id="text" className="size-font">Add Employee{employee.firstName}</Header>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Form >
            <FormField required={true} error={errors.firstName?.message}>
              <label id='text'>First Name</label>
              <input {...register("firstName")} defaultValue={employee ? employee.firstName : ''}
              />
              <p className="error">{errors.firstName?.message}</p>
            </FormField>
            <FormField required={true} error={errors.lastName?.message}>
              <label id='text'>Last Name</label>
              <input {...register("lastName")} defaultValue={employee ? employee.lastName : ''} />
              <p className="error">{errors.lastName?.message}</p>
            </FormField>
            <FormField required={true} error={errors.tz?.message}>
              <label id='text'>tz</label>
              <input {...register("tz")} defaultValue={employee ? employee.tz : ''} />
              <p className="error">{errors.tz?.message}</p>
            </FormField>
            <FormField required={true} error={errors.startDate?.message}>
              <label id='date'>Start Date</label>
              <input
                type="date"
                {...register("startDate")}
                defaultValue={employee ? employee.startDate : ''}
              />
              <p className="error">{errors.startDate?.message}</p>
            </FormField>
            <FormField required={true} error={errors.birthDate?.message} >
              <label id='date'
              >Birth Date</label>
              <input
                type="date"
                {...register("birthDate")}
                defaultValue={employee ? employee.birthDate : ''}
              />
              <p className="error">{errors.birthDate?.message}</p>
            </FormField>
            <FormField required={true} error={errors.gender?.message} id='text'>
              <label id='text'>Gender</label>
              <select {...register("gender")} >
                <option value="0" selected={(employee && employee.sex == "0") && (employee.sex !== "1")}> Male </option>
                <option value="1" selected={(employee && employee.sex == "1") && (employee.sex !== "0")}> Female </option>
              </select>
              <p className="error">{errors.gender?.message}</p>
            </FormField>
          </Form>
          <br />
          {fields.map((field, index) => (
            <Form key={index}>
              <FormGroup widths='equal' height="equal">
                <Button type="button" onClick={() => remove(index)} >
                  <Icon name='remove' size='large' color='teal' aria-hidden="true" class="teal remove bordered icon" />
                </Button>
                <FormField required={true} error={errors?.roles?.find((x, i) => errors.roles[i] && index == i)?.roleId?.message}>
                  <label id='number'>Role Name</label>
                  <p className="error">{errors?.roles?.find((x, i) => errors.roles[i] && index == i)?.name?.message}</p>
                </FormField>
                <FormField required={true} error={errors?.roles?.find((x, i) => errors.roles[i] && index == i)?.startDate?.message}>
                  <label id='text'>Start Date</label >
                  <input
                    type="date"
                    {...register(`roles.${index}.startDate`)}
                    defaultValue={field.startDate ? field.startDate : ""}
                  />
                  <p className="error">{errors?.roles?.find((x, i) => errors.roles[i] && index == i)?.startDate?.message}</p>
                </FormField>

                <FormField required={true} error={errors?.roles?.find((x, i) => errors.roles[i] && index == i)?.isAdministrative?.message}>
                  <label id='text'>Is Managment?</label>
                  <input type="checkbox"
                    {...register(`roles.${index}.isAdministrative`)}
                    size="huge"
                    required={false}
                    label='Is this a management role?'
                  />
                  <p className="error">{errors?.roles?.find((x, i) => errors.roles[i] && index == i)?.isAdministrative?.message}</p>
                </FormField>

              </FormGroup>
            </Form>
          ))}
          <br />
          <FormGroup widths='equal'>
            <Button type='button' onClick={() => {
              if (!errors.roles)
                append({})
            }}>Add Role</Button>


            <Button type="submit" className='text'>Save</Button>
          </FormGroup>
          <br />
          <br />
        </form>
      </Container >
    </>
  );
};
export default AddEditEmployee;