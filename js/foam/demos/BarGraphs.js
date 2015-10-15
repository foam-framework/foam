/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
CLASS({
  package: 'foam.demos',
  name: 'BarGraphs',
  extends: 'foam.ui.View',
  requires: [
    'MDAO',
    'foam.glang.BarExpr',
    'foam.glang.GroupBarExpr',
    'foam.glang.GridBarExpr',
  ],

  properties: [
    {
      name: 'dao',
      factory: function() {
        var dao = this.MDAO.create({ model: this.Employee });

        for (var i = 0; i < 50; i++) {
          dao.put(this.generateEmployee(i));
        }

        return dao;
      }
    },
    {
      name: 'departments',
      factory: function() {
        return ['Engineering', 'Sales', 'Management', 'Operations'];
      }
    },
    {
      name: 'ageBar',
      factory: function() {
        var bar = this.BarExpr.create({
          expr: this.Employee.AGE,
          width: 800,
          height: 300
        });
        this.dao.select(bar);
        return bar;
      }
    },
    {
      name: 'sortedAgeBar',
      factory: function() {
        var bar = this.BarExpr.create({
          expr: this.Employee.AGE,
          width: 800,
          height: 300
        });
        this.dao.orderBy(this.Employee.AGE).select(bar);
        return bar;
      }
    },
    {
      name: 'deptCountsBar',
      factory: function() {
        var bar = this.GroupBarExpr.create({
          xFunc: this.Employee.DEPARTMENT,
          width: 100,
          height: 80
        });
        this.dao.select(bar);
        return bar;
      }
    },
    {
      name: 'deptGendersBar',
      factory: function() {
        var bar = this.GridBarExpr.create({
          xFunc: this.Employee.DEPARTMENT,
          yFunc: this.Employee.SEX,
          width: 100,
          height: 80
        });
        this.dao.select(bar);
        return bar;
      }
    },
  ],

  methods: [
    function generateEmployee(id) {
      var age = Math.floor(Math.random() * 45 + 20); // 20-65
      var sex = Math.random() <= 0.5 ? 'M' : 'F';
      var dept = Math.floor(Math.random() * this.departments.length);
      return this.Employee.create({ id: id, age: age, sex: sex, department: dept });
    }
  ],

  templates: [
    function CSS() {/*
      .bar-block {
        margin: 10px 20px 30px;
      }
      .bar-heading {
        font-size: 20px;
      }
    */},
    function toHTML() {/*
      <div id="%%id" %%cssClassAttr()>
        <div class="bar-block">
          <div class="bar-heading">Employee ages, unsorted</div>
          %%ageBar
        </div>
        <div class="bar-block">
          <div class="bar-heading">Employee ages, sorted by age</div>
          %%sortedAgeBar
        </div>
        <div class="bar-block">
          <div class="bar-heading">Employee count by department</div>
          %%deptCountsBar
        </div>
        <div class="bar-block">
          <div class="bar-heading">Employee count by department, splitting on gender</div>
          %%deptGendersBar
        </div>
      </div>
    */},
  ],

  models: [
    {
      name: 'Employee',
      properties: ['id', 'age', 'sex', 'department']
    }
  ],
});
