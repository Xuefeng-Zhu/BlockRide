const parseAddress = (rawAddress) => {
  const [address, geo] = rawAddress.split('at');

  return {
    address,
    geo: geo.split(',').map(parseFloat),
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
    price: price.toNumber(),
    origin: parseAddress(origin),
    destination: parseAddress(destination),
  }
}