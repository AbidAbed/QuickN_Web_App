
// export const binarySearch = async (messages , msg) => {

//     let left = 0
//     let right = messages.length - 1

//     let prevL
//     let prevR

//     console.log(messages);

//     while(left <= right){

//         let mid = Math.floor((left + right) / 2)

//         if(new Date(messages[mid]?.createdAt).getTime() === new Date(msg?.createdAt).getTime()){
//             left = right = prevL = prevR = mid 
//             break;
//         }else if(new Date(messages[mid]?.createdAt).getTime() >= new Date(msg?.createdAt).getTime() ){
//             right = mid = prevL = left
//         }else{
//             left = mid = prevR = right
//         }
//     }

//     if(prevR >= prevL){
//         messages.splice(prevR , 0 , msg)
//     }else{
//         messages.splice(prevL , 0 , msg)        
//     }

//     console.log(messages);

//     return JSON.parse(JSON.stringify(messages))

// }


export const binarySearch = (messages, msg) => {

    let left = 0;
    let right = messages.length - 1;
    let prevL = 0;
    let prevR = messages.length;

    while (left <= right) {

        let mid = Math.floor((left + right) / 2);

        if (new Date(messages[mid]?.createdAt).getTime() === new Date(msg?.createdAt).getTime()) {
            prevL = prevR = mid;
            break;
        } else if (new Date(messages[mid]?.createdAt).getTime() > new Date(msg?.createdAt).getTime()) {
            right = mid - 1;
            prevR = mid;
        } else {
            left = mid + 1;
            prevL = mid;
        }
    }

    const newMessages = [...messages]; // Create a shallow copy
    const indexToInsert = prevR >= prevL ? prevR : prevL;
    newMessages.splice(indexToInsert, 0, msg);

    return newMessages;
    
};
