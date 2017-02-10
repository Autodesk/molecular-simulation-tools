import axios from 'axios';

const RCSB_URL = 'https://files.rcsb.org/download';

const rcsbApiUtils = {
  getPdbById(pdbId) {
    const pdbUrl = `${RCSB_URL}/${pdbId}.pdb`;
    return axios.get(pdbUrl).then(res => ({
      pdbUrl,
      pdb: res.data,
    })).catch(() => {
      throw new Error('Couldn\'t find a pdb with that id.');
    });
  },
};

export default rcsbApiUtils;
