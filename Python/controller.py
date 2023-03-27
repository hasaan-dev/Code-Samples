from flask_restx import Resource
from flask import request
from ..util.income_statement_dto import IncomeStatementDto
from ..service.company_service import *
from ..service.income_statement_service import *
from ..util.decorator import *

api = IncomeStatementDto.api
income_statement = IncomeStatementDto.income_statement_serializer


@api.route('/')
class IncomeStatement(Resource):
    @api.marshal_list_with(income_statement, envelope='results')
    @token_required
    @requires_organization_auth
    def get(self, company_id):
        return get_company_statements(company_id)

    @api.response(201, 'Income statement successfully created.')
    @api.expect(income_statement)
    @token_required
    @requires_organization_auth
    def post(self, company_id):
        return create_statement(request.json, company_id)


@api.route('/<int:statement_id>')
class IncomeStatement(Resource):
    @api.marshal_with(income_statement, envelope='results')
    @token_required
    @requires_organization_auth
    def get(self, statement_id):
        return get_statement(statement_id)

    @api.response(204, 'Update particular field')
    @api.expect(income_statement)
    @token_required
    @requires_organization_auth
    def put(self, statement_id):
        return update_statement(statement_id, request.json)

    @api.response(204, 'Income statement successfully deleted.')
    @token_required
    @requires_organization_auth
    def delete(self, statement_id):
        return delete_statement(statement_id)


@api.route('/projected')
class IncomeStatement(Resource):
    @api.marshal_list_with(income_statement, envelope='results')
    @token_required
    @requires_organization_auth
    def get(self, company_id):
        return get_projected_income_statements(company_id)


@api.route('/actual')
class IncomeStatement(Resource):
    @api.marshal_list_with(income_statement, envelope='results')
    @token_required
    @requires_organization_auth
    def get(self, company_id):
        return get_actual_income_statements(company_id)


@api.route('/scenario/<int:scenario_id>')
class IncomeStatement(Resource):
    @api.marshal_list_with(income_statement, envelope='results')
    @token_required
    @requires_organization_auth
    def get(self, company_id, scenario_id):
        return get_income_statement_by_scenario(company_id, scenario_id)


@api.route('/graph_drivers/<int:scenario_id>')
class IncomeStatement(Resource):
    @token_required
    @requires_organization_auth
    def get(self, company_id, scenario_id):
        return graph_data_for_drivers(company_id, scenario_id)

    @api.response(204, 'Update particular field')
    @token_required
    @requires_organization_auth
    def put(self, company_id, scenario_id):
        return update_field(company_id, request.json, scenario_id)


@api.route('/graph_projections/<int:scenario_id>')
class IncomeStatement(Resource):
    @token_required
    @requires_organization_auth
    def get(self, company_id, scenario_id):
        return graph_data_for_projections(company_id, scenario_id)

    @api.response(204, 'Update particular field')
    @token_required
    @requires_organization_auth
    def put(self, company_id, scenario_id):
        return update_field(company_id, request.json, scenario_id, False)


@api.route('/financials/<int:scenario_id>')
class IncomeStatement(Resource):
    @token_required
    @requires_organization_auth
    def get(self, company_id, scenario_id):
        return income_statement_financials(company_id, scenario_id)


@api.route('/update_scenario/')
@api.doc(params={'id': {'in': 'query'}, 'values': {'in': 'query'}})
class IncomeStatement(Resource):
    @token_required
    @requires_organization_auth
    def get(self, company_id):
        return updated_income_statement_scenario(company_id, request)


@api.route('/<int:scenario_id>/save_scenario/')
@api.doc(params={'id': {'in': 'query'}, 'data': {'in': 'query'}})
class IncomeStatement(Resource):
    @api.response(204, 'Scenario is updated successfully')
    @token_required
    @requires_organization_auth
    def post(self, scenario_id, company_id):
        return save_updated_income_statement_scenario(company_id, scenario_id, request.json)
