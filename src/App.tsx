import React, { useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { Button } from 'antd';
import { FileTextOutlined, GithubOutlined } from '@ant-design/icons';
import { downloadFile } from './utils';

import './App.scss';

const ASTAR_START_BLOCK = 1638895;
const MOONBEAM_START_BLOCK = 1646715;
const ACALA_START_BLOCK = 1638215;
const TOTAL_BLOCKS = 1279;

const layout = {
  xaxis: { range: [0, TOTAL_BLOCKS], title: 'Block Since { Moonbeam@1646715, Astar@1638515 }' },
  yaxis: { range: [500000000000000000], title: 'Total Supply' },
  title: 'AUSD Total Supply on Moonbeam and Astar',
};

const App = () => {
  const [totalSupplyMoonbeam, setTotalSupplyMoonbeam] = useState<[number, number][]>([]);
  const [totalSupplyAstar, setTotalSupplyAstar] = useState<[number, number][]>([]);

  useEffect(() => {
    import('./totalSupplyMoonbeam.json').then(({ default: data }) => {
      const normalizedData = data
        .map(([block, supply]) => ([Number(block) - MOONBEAM_START_BLOCK, Number(supply)]));

      setTotalSupplyMoonbeam(normalizedData as [number, number][]);
    });

    import('./totalSupplyAstar.json').then(({ default: data }) => {
      const normalizedData = data
        .map(([block, supply]) => ([Number(block) - ASTAR_START_BLOCK, Number(supply)]));

      setTotalSupplyAstar(normalizedData as [number, number][]);
    });
  }, []);

  const dataLoaded = useMemo(() => (
    !!totalSupplyMoonbeam.length && !!totalSupplyAstar.length
  ), [totalSupplyMoonbeam, totalSupplyAstar]);

  const totalSupplyAll = useMemo(() => (
    !dataLoaded
      ? []
      : totalSupplyMoonbeam.map(([block, supply]) => (
        [block, supply + totalSupplyAstar[block][1]]
      ))
  ), [totalSupplyMoonbeam, totalSupplyAstar]);

  const exportToJson = () => {
    downloadFile(
      JSON.stringify(totalSupplyMoonbeam),
      'totalSupplyMoonbeam.json',
      'text/json'
    );

    downloadFile(
      JSON.stringify(totalSupplyAstar),
      'totalSupplyAstar.json',
      'text/json'
    );
  };

  // console.log(totalSupplyMoonbeam);
  // console.log(totalSupplyAstar);
  // console.log(totalSupplyAll);

  return (
    <div id='app'>
      { dataLoaded && (
        <>
          <Plot
            data={ [
              {
                name: 'Moonbeam',
                x: totalSupplyMoonbeam.map(d => d[0]),
                y: totalSupplyMoonbeam.map(d => d[1]),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'rgb(230, 0, 122)', width: 3 },
              },
              {
                name: 'Astar',
                x: totalSupplyAstar.map(d => d[0]),
                y: totalSupplyAstar.map(d => d[1]),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'rgb(0, 145, 255)', width: 3 },
              },
              {
                name: 'Total',
                x: totalSupplyAll.map(d => d[0]),
                y: totalSupplyAll.map(d => d[1]),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'rgb(52, 235, 186)', width: 3 },
              },
            ] }
            layout={ layout }
            style={{
              marginTop: '30px',
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
