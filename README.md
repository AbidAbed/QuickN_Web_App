# Sunday Tasks, 04-02-2024

## Fixing The DeleteMsg API For Admin

The API was deleting all files

### Steps Taken
1. Analyze the bug 
2. Fixing the bug from the backend in the API


## Fixing The Get All Announcements Report

There was a bug in the API that causes the report to not be  downloaded

### Steps Taken
1. Analyze the bug and it's cause 
2. Fixing the API that returns the report file


## Integrating The New Features 

We had to integrate the new features in my side and the new features on Abid's side

## Steps Taken
1. Understanding each others features so no conflict appears
2. Creating a github account to make the integration process easier in the feature
3. Texting the integrated release
 
## Testing Video And Audio Calls (In Progress)

I was testing libraries on a different new website to integrate it once it works

### Steps Taken
1. Creating a new testing website for only audio and video calls
2. Testing simple-peer library with audio and video calls
3. Testing Socket-io library  with simple-peer




# Monday Tasks, 05-02-2024

## sort the user names
## Steps Taken
1. use .sort() array method to sort the names in asec way

## allow the user to send the same file twice
## Steps Taken
1. update the handleMsgSend , fileUpload functions , and reset the file.value to make it empty

## file cancel when change the chat (in documents case) (BUG)
## Steps Taken
1. update the multer middleware , update the setTimeout() time limit 


## delete the converted folder from the public folder , delete from the database , ui



# Tuesday Tasks, 06-02-2024

## create an api to handle online/offline users ("/getOnlineUsers/:userId")

## add a key in user DB schema "isOnline" (Boolean)

## make an api call in the socket in "addUser" , "disconnect" events 

## create an events ("offlineUserId") , ("onlineUserId")  in the socket to trigger the online and offline 

## update the context reducer in the ui , add isOnline key

## note : i comment the axios.put api call in the socket "addUser" event

## start with the voice call feature



# Wed Tasks, 07-02-2024

## hidden messages feature

## update Message model in DB and hiddenFor key : Array of hidden users ids

## update the newMessage , getMessagesInsideConversation conrtollers in the backend to integrate the hidden msg fun

## update the search messages controller to not show the hidden messages in the search bar

## test the search for hidden messages in the ui



# Thursday Tasks , 08-02-2024
