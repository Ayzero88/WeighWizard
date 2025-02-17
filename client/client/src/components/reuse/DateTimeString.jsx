

const DateTimeString = ({dateTimeString}) => {
 
    if(!dateTimeString) return;

    // Create a new Date object with the given date and time string
    const dateTime = new Date(dateTimeString);
    
    // Get the individual components of the date and time
    const year = dateTime.getFullYear();
    const month = dateTime.getMonth() + 1; // Months are zero-based, so add 1
    const day = dateTime.getDate();
    let hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const seconds = dateTime.getSeconds();
    // Determine AM/PM and convert hours to 12-hour format
    hours = hours % 12 || 12;
    const amPM = hours >= 12 ? 'PM' : 'AM';


    // Format the date and time components into a proper format
    const formattedDateTime = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${amPM}`;

    

    return formattedDateTime;
}

export default DateTimeString