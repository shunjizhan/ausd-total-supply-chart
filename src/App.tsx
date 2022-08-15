import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Button } from 'antd';
import { FileTextOutlined, GithubOutlined } from '@ant-design/icons';
import { downloadFile } from './utils';

import './App.scss';

const START_BLOCK = 1646715;
const END_BLOCK = 1647993;

const layout = {
  xaxis: { range: [START_BLOCK, END_BLOCK], title: 'Block' },
  yaxis: { range: [500000000000000000], title: 'Total Supply' },
  title: 'AUSD Total Supply on Moonbeam (1646715 on Moonbeam ≈ 1638215 on Acala)',
};

const App = () => {
  const [totalSupply, setTotalSupply] = useState<[number, number][]>([]);

  useEffect(() => {
    import('./totalSupply.json').then(data => {
      const filteredData = data.default
        .map(([block, supply]) => ([Number(block), Number(supply)]))
        .filter(([block]) => START_BLOCK <= block && block <= END_BLOCK);

      setTotalSupply(filteredData as [number, number][]);
    });
  }, []);

  const exportToJson = () => {
    downloadFile(
      JSON.stringify(totalSupply),
      'totalSupply.json',
      'text/json'
    );
  };

  return (
    <div id='app'>
      { !!totalSupply.length && (
        <>
          <Plot
            data={ [
              {
                x: totalSupply.map(d => d[0]),
                y: totalSupply.map(d => d[1]),
                type: 'scatter',
                mode: 'lines',
                marker: { color: 'rgb(230, 0, 122)' },
              },
            ] }
            layout={ layout }
            style={{
              marginTop: '100px',
              display: 'flex',
              height: '80vh',
              width: '80vw',
            }}
          />

          <Button
            type='primary'
            onClick={ exportToJson }
          >
            <FileTextOutlined /> Download Data
          </Button>
          <Button
            type='primary'
            onClick={ () => window.open('https://github.com/AcalaNetwork/bodhi.js/blob/ausd-supply-script/scripts/ausd-total-supply.ts', '_blank') }
          >
            <GithubOutlined /> Checkout Script
          </Button>
        </>
      )}
    </div>
  );
};

export default App;
