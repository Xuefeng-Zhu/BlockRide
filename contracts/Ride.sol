pragma solidity ^0.4.14;

contract Ride {
    struct Trip {
        string origin;
        string destination;
        uint price;
        bool active;
    }

    struct Driver {
        address id;
        string name;
        string car;
        string[] reviews;
        uint[] scores;
        int lat;
        int lng;
    }

    struct Rider {
        address id;
        string name;
        string[] reviews;
        uint[] scores;
    }

    mapping(address => Driver) public drivers;
    mapping(address => Rider) public riders;
    mapping(address => Trip) public trips;
    address[] driverList;
    address[] riderList;

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
        trip.origin = origin;
        trip.destination = destination;
        trip.price = price;
        trip.active = true;
    }
}