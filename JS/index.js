import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useRecoilState } from 'recoil'

import {
  incomeStatementGraphDriverState,
  incomeStatementGraphProjectedState,
  incomeStatementFinancialsState,
  updateGraphResponse
} from 'store/companies'
import Drivers from './Drivers'
import {
  fetchDriversIncomeStatment,
  fetchGraphProjectionsIncomeStatment,
  fetchFinancialsIncomeStatment,
  updatedDriverGraphIncomeStatement
} from 'api/companies'
import Financials from './Financials'
import { incomeStatementDriversList, nestedTabList, noscrollbody, scrollbody } from 'helpers'
import Projections from './Projections'
import UpdateGraphsModal from 'containers/CompanyDetail/UpdateGraphs'
import './styles.scss'

let updateGraphState = []

export default ({ scenarioRecord, setScenarioButton, setType, updateGraph }) => {
  let [scenarioId, scenario] = scenarioRecord
  const urlParams = useParams()
  const [drivers, setDrivers] = useRecoilState(incomeStatementGraphDriverState)
  const [financials, setFinancials] = useRecoilState(incomeStatementFinancialsState)
  const [graphProjections, setGraphProjections] = useRecoilState(incomeStatementGraphProjectedState)
  const [isOpen, setIsOpen] = useState(false)
  const [, setGraphResponse] = useRecoilState(updateGraphResponse)
  const [selectedKey, setSelectedKey] = useState(undefined)
  const [, setUpdatedValues] = useState([])

  useEffect(async () => {
    setDrivers([])
    if (scenarioId == null) return

    setDrivers(await fetchDriversIncomeStatment(urlParams.id, scenarioId))
    setGraphProjections(await fetchGraphProjectionsIncomeStatment(urlParams.id, scenarioId))
    setFinancials(await fetchFinancialsIncomeStatment(urlParams.id, scenarioId))
    updateGraphState = []
  }, [scenarioId])

  useEffect(() => {
    updateGraphState = []
  }, [updateGraph])

  const renderNestedTabs = nestedTabList.map(a => <Tab key={a}>{a}</Tab>)

  const setData = value => {
    setSelectedKey(value)
    setIsOpen(true, noscrollbody())
  }

  const closeModal = (value, cb) => {
    setUpdatedValues([])
    setIsOpen(value, cb)
  }

  const onSubmit = async (values, initialValues) => {
    values.graphs.filter(v => {
      if (v.category.includes('E') && initialValues.includes(v.category)) {
        updateGraphState.push({
          type: v.type,
          value: parseFloat(v.value, 10),
          category: v.category
        })
      }
    })
    let arrayUniqueByKey = getUniqueGraphValues(updateGraphState)

    setUpdatedValues(arrayUniqueByKey)
    let response = await updatedDriverGraphIncomeStatement(
      urlParams.id,
      scenarioId,
      arrayUniqueByKey
    )
    setDrivers(response.drivers)
    setGraphProjections(response.projections)
    setFinancials(response.financial)
    setGraphResponse(response.unformated)
    closeModal(false, scrollbody())
    setType('income-statement')
    if (!scenario.isBase) {
      setScenarioButton(true)
    }
  }

  const onDragFinish = async ({ target: { category }, newPoint: { y } }, type) => {
    if (!scenario.isBase) {
      setScenarioButton(true)
    }

    updateGraphState.push({
      type: type,
      value: y,
      category: category
    })
    let arrayUniqueByKey = getUniqueGraphValues(updateGraphState)
    setUpdatedValues(arrayUniqueByKey)

    let response = await updatedDriverGraphIncomeStatement(
      urlParams.id,
      scenarioId,
      arrayUniqueByKey
    )
    setDrivers(response.drivers)
    setGraphProjections(response.projections)
    setFinancials(response.financial)
    setGraphResponse(response.unformated)

    setType('income-statement')
  }

  const getUniqueGraphValues = graphValues => {
    let values = graphValues.reverse().reduce((graphValue, obj) => {
      let exist = graphValue.find(
        ({ category, type }) => obj.category === category && obj.type === type
      )

      if (!exist) graphValue.push(obj)
      updateGraphState = graphValue
      return graphValue
    }, [])

    return values
  }

  return (
    <>
      <Tabs forceRenderTabPanel className={'income-statement-tabs'}>
        <TabList>
          <div className={'level2-tabs'}> {renderNestedTabs} </div>
        </TabList>

        <TabPanel>
          <Drivers data={drivers} setData={setData} onDragFinish={onDragFinish} />
        </TabPanel>

        <TabPanel>
          <Projections data={graphProjections} />
        </TabPanel>

        <TabPanel>
          <Financials financials={financials} scenario={scenarioId} />
        </TabPanel>
      </Tabs>

      {drivers && graphProjections && (
        <UpdateGraphsModal
          graphData={drivers}
          isOpen={isOpen}
          setIsOpen={closeModal}
          selectedKey={selectedKey}
          onSubmit={onSubmit}
          text={
            selectedKey
              ? incomeStatementDriversList.find(item => item.key == selectedKey).modalTitle
              : ''
          }
        />
      )}
    </>
  )
}
