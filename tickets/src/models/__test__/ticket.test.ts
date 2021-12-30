import { Ticket } from "../ticket";

it('Implements optimistic concurrency control', async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 5,
        userId: 'ABC123'
    })

    // Save the ticket to the database
    await ticket.save();

    // Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // Make 2 seperate changes to the tickets we fetched
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });

    // Save the first fetched ticket
    await firstInstance!.save();

    // Save the second fetched ticket and expect an error
    try {
        await secondInstance!.save();
    } catch (err) {
        return;
    }

    throw new Error('Should not reach this point!');
});

it('Implement the version number on multiple saves', async() => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: 'Concert',
        price: 5,
        userId: 'ABC123'
    })

    // Save the ticket to the database
    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
});