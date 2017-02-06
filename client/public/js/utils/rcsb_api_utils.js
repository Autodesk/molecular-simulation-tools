import axios from 'axios';

const RCSB_URL = 'https://files.rcsb.org/download';

const rcsbApiUtils = {
  getPdbById(pdbId) {
    const pdbUrl = `${RCSB_URL}/${pdbId}.pdb`;
    return axios.get(pdbUrl).then(res => ({
      pdbUrl,
      pdb: res.data,
    })).catch((err) => {
      throw err;
    });
  },
};

export default rcsbApiUtils;
