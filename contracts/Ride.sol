pragma solidity ^0.4.13;

contract Ride {
    struct Trip {
        bool active;
        address rider;
        address driver;
        string origin;
        string destination;
        uint price;
    }

    struct Driver {
        address id;
        string name;
        string car;
        int lat;
        int lng;
        address trip;
    }

    struct Rider {
        address id;
        string name;
        address trip;
    }

    mapping(address => Driver) public drivers;
    mapping(address => Rider) public riders;
    mapping(address => Trip) public trips;
    address[] public driverList;
    address[] public riderList;

    event DriverLoc(
        address driver
    );

    event TripShared(
        address trip
    );

    event TripAccepted(
        address driver,
        address rider
    );

    event TripConfirmed(
        address driver,
        address rider
    );

    event TripCompleted(
        address driver,
        address rider
    );
    
    function () payable {
        
    }

    function becomeDriver(string name, string car) public {
        Driver storage driver = drivers[msg.sender];

        assert(driver.id == 0x0);

        driver.id = msg.sender;
        driver.name = name;
        driver.car = car;
        driverList.push(msg.sender);
    }
    
    function becomeRider(string name) public {
        Rider storage rider = riders[msg.sender];

        assert(rider.id == 0x0);
        
        rider.id = msg.sender;
        rider.name = name;
        riderList.push(msg.sender);
    }

    function shareLoc(int lat, int lng) public {
        Driver storage driver = drivers[msg.sender];

        if (driver.id != 0x0) {
            driver.lat = lat;
            driver.lng = lng;
            DriverLoc(driver.id);
        }
    }

    function removeLoc() public {
        Driver storage driver = drivers[msg.sender];

        if (driver.id != 0x0) {
            driver.lat = 0;
            driver.lng = 0;
        }
    }

    function shareTrip(string origin, string destination, uint price) public {
        Rider storage rider = riders[msg.sender];
        assert(rider.id != 0x0);
        assert(rider.trip == 0x0);

        Trip storage trip = trips[msg.sender];
        trip.rider = msg.sender;
        trip.origin = origin;
        trip.destination = destination;
        trip.price = price;
        trip.active = true;

        TripShared(msg.sender);
    }

    function stopTrip() public {
        Trip storage trip = trips[msg.sender];

        assert(trip.rider != 0x0);
        trip.active = false;
    }

    function acceptTrip(address trip) public {
        Driver storage driver = drivers[msg.sender];

        if (driver.id != 0x0) {
            driver.trip = trip;
            TripAccepted(driver.id, trip);
        }
    }

    function confirmTrip(address driverAddress) public payable {
        Driver storage driver = drivers[driverAddress];

        assert(driver.trip == msg.sender);

        Trip storage trip = trips[msg.sender];
        trip.driver = driver.id;

        Rider storage rider = riders[msg.sender];
        rider.trip = msg.sender;

        this.transfer(trip.price);

        TripConfirmed(driver.id, rider.id);
    }

    function denyTrip(address driverAddress) public {
        Driver storage driver = drivers[driverAddress];

        assert(driver.trip == msg.sender);
        driver.trip = 0x0;
    }

    function completeTrip() public {
        Trip storage trip = trips[msg.sender];

        assert(trip.active);

        trip.active = false;
        Driver storage driver = drivers[trip.driver];
        driver.trip = 0x0;
        Rider storage rider = riders[msg.sender];
        rider.trip = 0x0;

        trip.driver.transfer(trip.price * 9 / 10);
        TripCompleted(driver.id, rider.id);
    }
}