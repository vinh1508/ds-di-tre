import { ApiUrl } from '../commons/Constants';
import moment from 'moment';
import axios from 'axios';

const getHeaders = () => ({
    'access-token': '',
    'utc-offset': moment().utcOffset()
});

class API {
    constructor() {
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    POST({url,data,headers={}}) {
        const options = {
            method: 'POST',
            headers: { ...getHeaders(),...headers },
            data: data,
            url,
          };
          console.log(JSON.stringify(options.headers));
        return axios(options);
    }

    report(formData) {
        return this.POST({
            url:ApiUrl.report,
            data:formData,
            headers:{
                'Content-Type':'multipart/form-data'
            }
        });
    }
}

export default new API();
