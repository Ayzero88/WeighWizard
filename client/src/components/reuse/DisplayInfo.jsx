import axios from "axios";
import { BaseUrl } from "./BaseUrl";

const DisplayInfo = async({setOwner, setLogo, setPrintType}) => {
    
  
                try {
                    const [response, response2] = await Promise.all([
                        axios.get(`${BaseUrl}/ownerinfo`),
                        axios.get(`${BaseUrl}/print-type`)
                    ]);
                        setOwner(response.data);
                        setPrintType(response2.data);
                        
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
