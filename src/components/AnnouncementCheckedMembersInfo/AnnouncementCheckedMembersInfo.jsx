import React from 'react'
import "./AnnouncementCheckedMembersInfo.css"
import CloseIcon from '@mui/icons-material/Close';
import SimCardDownloadIcon from '@mui/icons-material/SimCardDownload';
import { axiosObj } from '../../utils/axios';
import { useAppContext } from '../../context/appContext';



const AnnouncementCheckedMembersInfo = ({announcement , setOpenAnnouncementInfo}) => {

    const {token} = useAppContext()

    //console.log(announcement);
    const handlePdfDownload = async () => {

        try {

            const pdfData = {
                announcementTitle: announcement?.announcementTitle ,
                checkedUsers : announcement?.checkedUsers?.map(checkedUser => ({
                    username : checkedUser?.username ,
                    checkedAt : !isNaN(checkedUser.checkedAt) && `${new Date(checkedUser?.checkedAt).getMonth() + 1} / ${new Date(checkedUser?.checkedAt).getDate()} / ${new Date(checkedUser?.checkedAt).getFullYear()} __ ${new Date(checkedUser?.checkedAt).getHours() - 12} : ${new Date(checkedUser?.checkedAt).getMinutes() < 10 ? `0${new Date(checkedUser?.checkedAt).getMinutes()}`:new Date(checkedUser?.checkedAt).getMinutes()} ${new Date(checkedUser?.checkedAt).getHours() < 12 ? "am" : "pm"}`,
                }))
            }
            
            await axiosObj.post("/announcement/generate-pdf" , pdfData , {
                headers : {
                    token_header : `Bearer ${token}`
                },
                responseType : "blob" // to indicate that the response should be treated as a Blob

            }).then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data])); // url will contain the pdf file content as a blob obj
                const a = document.createElement('a');
                a.href = url;
                a.download = `${pdfData.announcementTitle}.pdf`
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url)

            })
            .catch(error => console.error('Error generating PDF:', error));

        } catch (error) {
            //console.log(error);
        }

    }


  return (
    <div className='announcementCheckedMembersInfo'>

        <div className='announcementCheckedMembersInfoContainer'>

            <div className='announcementCheckedMembersInfoHeaderContainer'>
                <h5 className='announcementCheckedMembersInfoHeader'>{announcement.announcementTitle}</h5>
                
                <div className='checkedAnnounBtns'>
                    <CloseIcon onClick={() => setOpenAnnouncementInfo(false)} className='closeIcon'/>
                    <SimCardDownloadIcon onClick={handlePdfDownload} className='closeIcon'/>
                </div>

            </div>
            
            <div className='membersInofContainer'>

                {[...new Set(announcement.checkedUsers.map(user => user.username))].map(username => {
                const user = announcement.checkedUsers.find(user => user.username === username);
                    return (
                        <div key={user.userId} className='membersInfo'>
                            <span className='memberName'>{user.username}</span>
                            <span className='checkedTime'>{new Date(user.checkedAt).getMonth() + 1} / {new Date(user.checkedAt).getDate()} / {new Date(user.checkedAt).getFullYear()} <span className='atWord'>__</span>{new Date(user.checkedAt).getHours() - 12} : {new Date(user.checkedAt).getMinutes() < 10 ? `0${new Date(user.checkedAt).getMinutes()}` : new Date(user.checkedAt).getMinutes()} {new Date(user.checkedAt).getHours() < 12 ? "am" : "pm"}</span>
                        </div>
                    )
                })}

            </div>

        </div>


    </div>
  )
}

export default AnnouncementCheckedMembersInfo