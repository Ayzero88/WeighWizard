import axios from "axios";

const DisplayInfo = async({setOwner, setLogo}) => {
    
  
                try {
                    const response = await axios("http://localhost:8080/ownerinfo");
                        setOwner(response.data);
                       
                        if (response.data.logo) {
                            setLogo(`data:image/png;base64,${response.data.logo}`);
                        } else {
                            setLogo(null); 
                        }
                } catch (error) {
                    console.error("Error fetching owner info:", error);
                    setOwner("Unknown Owner");
                    setLogo(null);
                };

            };
export default DisplayInfo;
