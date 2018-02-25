const parseAddress = (rawAddress) => {
  const [address, geo] = rawAddress.split('at');

  return {
    address,
    geo: geo.split(','),
    raw: rawAddress
  };
};

export const parseTrip = (trip) => {
  const [active, rider, driver, origin, destination, price] = trip;

  if (!active) {
    return
  }

  return {
    rider,
    driver,
    price,
    origin: parseAddress(origin),
    destination: parseAddress(destination),
  }
}