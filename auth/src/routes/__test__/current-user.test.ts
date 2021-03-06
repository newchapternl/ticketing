import request from "supertest";
import { app } from "../../app";
import { authsignin } from "../../test/authsignin";

it('Responds with details about the current user', async () => {
    const cookie = await authsignin();

    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send({})
        .expect(400);
    
    // console.log(response.body);
    expect(response.body.currentUser.email).toEqual('test@test.com');
    
});

it('Responds with null if not authenticated', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send({})
        .expect(200);
    
    expect(response.body.currentUser).toEqual(null);
    
});