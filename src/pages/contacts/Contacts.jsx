import React, { useEffect, useState } from 'react'
import "./contacts.css"
import { axiosObj } from '../../utils/axios';
import { useAppContext } from "../../context/appContext"
import { toast } from "react-toastify";


const Contacts = () => {

    const toastOptions = {
        position: "top-center",
        autoClose: 2000,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      };
    
    const {token , user} = useAppContext()

    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' });
    

    useEffect(() => {

        const getUserContacts = async () => {
            try {
                const response = await axiosObj.get("/auth/get-contact-list" , {
                    headers : {
                        "token_header" : `Bearer ${token}`
                    }
                })
                setContacts(response.data)
            } catch (error) {
                //console.log(error)
                toast.error(error.response.data.msg , toastOptions)        
            }
        }

        getUserContacts()

    } , [])



    const addContact = async () => {

        if (!newContact.email || !newContact.phone) {
            toast.error("Please provide email and phone number.", toastOptions);
            return;
        }

        // Validate email format
        if (!/^\S+@\S+\.\S+$/.test(newContact.email)) {
            toast.error("Please enter a valid email address.", toastOptions);
            return;
        }

        // Validate phone number format (10 digits starting with '07')
        if (!/^(07)\d{8}$/.test(newContact.phone)) {
            toast.error("Please enter a valid phone number starting with '07' and being 10 digits.", toastOptions);
            return;
        }

        
        try {
            const response = await axiosObj.post(`/auth/add-contact-user` , newContact , {
                headers : {
                    "token_header" : `Bearer ${token}`
                }
            })

            setContacts([...contacts , response.data])
            setNewContact({email : "" , phone : ""})
            toast.success(`${newContact.email.split("@")[0]} added to your contacts list successfully` , toastOptions)
        
        } catch (error) {
            //console.log(error)
            toast.error(error.response.data.msg , toastOptions)        
        }
    }
    


    const removeContact = async (contactId) => {
        try {

            await axiosObj.patch(`/auth/remove-contact/${contactId}` , {} , {
                headers : {
                    "token_header" : `Bearer ${token}`
                }
            })

            setContacts(contacts.filter(contact => contact._id !== contactId))

            toast.info("Contact removed successfulyy" , toastOptions)

        } catch (error) {
            toast.error(error.response.data.msg , toastOptions) 
        }
    }




  return (

    <>

    <h4 className='contact-header'>Quickn Contacts</h4>

    <div className="contacts-page">

      <div className="contacts-column">

        <h3 className='contacts-header'>Contacts</h3>

        <div className="scrollable-contact-list">

          {contacts.map(contact => (
            <div key={contact._id} className="contact-item">

              <span className='contact-info'>{contact.username}</span>
              <span className='contact-info'>{contact.email}</span>
              {/* <span className='contact-info'>{contact.phone}</span> */}
              <button className='remove-contact-btn' onClick={() => removeContact(contact._id)}>Remove</button>

            </div>
          )).reverse()}

        </div>

      </div>

      <div className="add-contact-column">
        
        <h3 className='contacts-header'>Add new contact</h3>

        {/* <input
          type="text"
          placeholder="username"
          value={newContact.name}
          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
        /> */}

        <input
          type="text"
          placeholder="name@example.com"
          value={newContact.email}
          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
        />

        <input
          type="text"
          placeholder="phone number"
          value={newContact.phone}
          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
        />

        <button onClick={addContact}>Add Contact</button>
        <button className='can-btn' onClick={addContact}>Cancel</button>

      </div>

    </div>
    
    </>
  )
}

export default Contacts