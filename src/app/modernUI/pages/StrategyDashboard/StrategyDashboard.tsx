import { EChain } from 'app/common/constants/chains';
import { Layout, Modal, Tab, Tabs } from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { useEffect, useState } from 'react';
import { Text } from 'grommet';
import { Box } from 'grommet';
import { Background } from "./blocks/Background"
import { Piechart } from "./components/Piechart"
import { getBufferAmountForAssetPolygon, getAllLiquidityDirectionInformation, getLegacyLiquidityDirectionValue } from "./functions/getLiquidityDirectionValues"
export const StrategyDashboard = ({ ...rest }) => {
    const [usdData, setUsdData] = useState<any>([]);
    const [eurData, setEurData] = useState<any>([]);
    const [ethData, setEthData] = useState<any>([]);
    const [btcData, setBtcData] = useState<any>([]);

    console.log(getBufferAmountForAssetPolygon(0))
    useEffect(() => {
        let isMounted = true;  // add this line
        const updateUSDInfo = async () => {
            let polygonBuffer = await getBufferAmountForAssetPolygon(0)
            let polygonBufferInfo = { name: "Polygon Buffer", value: polygonBuffer }
            let otherSTuff = await getAllLiquidityDirectionInformation(0);
            let legacyDirection = await getLegacyLiquidityDirectionValue(0);
            let tempData = [polygonBufferInfo, ...legacyDirection, ...otherSTuff]
            if (isMounted) {
                setUsdData(tempData)
            }
        }

        const updateEURInfo = async () => {
            let polygonBuffer = await getBufferAmountForAssetPolygon(1)
            let polygonBufferInfo = { name: "Polygon Buffer", value: polygonBuffer }
            let otherSTuff = await getAllLiquidityDirectionInformation(1);
            let legacyDirection = await getLegacyLiquidityDirectionValue(1);
            let tempData = [polygonBufferInfo, ...legacyDirection, ...otherSTuff]
            if (isMounted) {
                setEurData(tempData)
            }
        }

        const updateETHInfo = async () => {
            let polygonBuffer = await getBufferAmountForAssetPolygon(2)
            let polygonBufferInfo = { name: "Polygon Buffer", value: polygonBuffer }
            let otherSTuff = await getAllLiquidityDirectionInformation(2);
            let legacyDirection = await getLegacyLiquidityDirectionValue(2);
            let tempData = [polygonBufferInfo, ...legacyDirection, ...otherSTuff]
            if (isMounted) {
                setEthData(tempData)
            }
        }

        const updateBTCInfo = async () => {
            let polygonBuffer = await getBufferAmountForAssetPolygon(3)
            let polygonBufferInfo = { name: "Polygon Buffer", value: polygonBuffer }
            let otherSTuff = await getAllLiquidityDirectionInformation(3);
            let legacyDirection = await getLegacyLiquidityDirectionValue(3);
            let tempData = [polygonBufferInfo, ...legacyDirection, ...otherSTuff]
            if (isMounted) {
                setBtcData(tempData)
            }
        }
        updateUSDInfo();
        updateEURInfo();
        updateETHInfo();
        updateBTCInfo();

        return () => { isMounted = false }
    }, []);


    return (
        <ResponsiveContext.Consumer>
            {size => (
                <Layout>


                    <Background heading={"Strategy Dashboard"}>
                        <Piechart data={usdData} title="USD Liquidity Direction" />
                        <Piechart data={eurData} title="EUR Liquidity Direction" />
                        <Piechart data={ethData} title="ETH Liquidity Direction" />
                        <Piechart data={btcData} title="BTC Liquidity Direction" />

                    </Background>
                </Layout>
            )}
        </ResponsiveContext.Consumer>
    );
};
