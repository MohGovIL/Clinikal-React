import {tokenInstanceGenerator} from "./AxiosWithTokenInstance";
import {ApiTokens} from "./ApiTokens";
/**
 * @author Idan Gigi gigiidan@gmail.com
 * @fileOverview Where all the apis that uses the normal FhirApi Token
 */

const fhirTokenInstance = () => tokenInstanceGenerator(ApiTokens.FHIR.tokenName);

export const getAppointment = async () => {
    try {
        return await fhirTokenInstance().get('apis/fhir/v4/Appointment?_include=Appointment:patient')
    } catch (err) {
        console.log(err)
    }
};
