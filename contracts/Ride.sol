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
        Trip storage trip = trips[msg.sender];
        trip.rider = msg.sender;
        trip.origin = origin;
        trip.destination = destination;
        trip.price = price;
        trip.active = true;
    }

    function stopTrip() public {
        Trip storage trip = trips[msg.sender];

        assert(trip.rider != 0x0);
        trip.active = false;
    }
}