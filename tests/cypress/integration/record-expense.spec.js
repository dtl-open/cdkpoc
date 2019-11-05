import Amplify, { Auth } from "aws-amplify";
import moment from 'moment';


const baseUrl = 'https://api.demo.dtnz.co.nz';

describe('User authentication', () => {

    let authKey = '';
    const username = '';
    const password = '';

    // before(async function () {
    //     authKey = await getAccessToken(username, password);
    // });

    it('should be successful with valid token', () => {

        // cy.log(`Auth Token ${authKey}`);

        const recordExpenseRequest = buildRecordExpenseRequest(authKey);

        cy.request(recordExpenseRequest)
            .should((response) => {

                cy.log(response);
                expect(response.status).to.eq(201)
                expect(response.body.recordedAt).to.be.a("String")
                expect(response.body.expenseType).to.be.equal('medical')
            });
    });

    // it('should return 401 when send an invalid token', () => {

    //     const recordExpenseRequest = buildRecordExpenseRequest('invalid token');

    //     cy.request(recordExpenseRequest)
    //         .should((response) => {

    //             cy.log(response);
    //             expect(response.status).to.eq(401)
    //         });
    // });
});

function buildRecordExpenseRequest(authKey) {
    const randomNum = Math.floor(Math.random() * (1000 - 100) + 100) / 10;
    const yesterday = moment(new Date()).add(-1, 'days').format('YYYY-MM-DD');
    const recordExpenseRequest = {
        url: `${baseUrl}/expensems/expenses`,
        method: 'POST',
        body: {
            "expenseType": 'medical',
            "amount": randomNum,
            "labels": [],
            "recordedAt": `${yesterday}`
        },
        failOnStatusCode: false,
        headers: {
            Authorization: `Bearer ${authKey}`,
            'x-user-id': 'kasun'
        }
    };
    return recordExpenseRequest;
}

async function getAccessToken(username, password) {

    Amplify.configure({
        region: "ap-southeast-2",
        userPoolWebClientId:"5a7vrdr4nmsbeb0rfh0d6h8bkr",
        userPoolId:"ap-southeast-2_IwAYwaPDq",
        mandatorySignIn:"True"
    });

    console.debug("Fetch access token for registered user.");

    return new Promise((resolve, reject) => {
        Auth.signIn(username, password)
        .then((res) => {
            console.log("Response: ", JSON.stringify(res));
            if(res && res.signInUserSession && res.signInUserSession.idToken && res.signInUserSession.idToken.jwtToken) {
                resolve(res.signInUserSession.idToken.jwtToken);
            } else {
                reject(new Error(`No valid token found for user`));
            }
            
        })
        .catch(err => {
            console.log("Error: ", err);
            reject(err);
        })
    })
}