  (function () {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0];
    const old150 = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate() + 1).toISOString().split('T')[0];
    const old150minus1 = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate() - 1).toISOString().split('T')[0];
    const year12 = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate() + 1).toISOString().split('T')[0];
    const year12plus1 = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate() + 2).toISOString().split('T')[0];
    const month6 = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate() + 1).toISOString().split('T')[0];
    const month6plus1 = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate() + 2).toISOString().split('T')[0];
    const month3 = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate() + 1).toISOString().split('T')[0];
    const month3plus1 = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate() + 2).toISOString().split('T')[0];

    const testData = [
      ["", "", "", "", ""],
      [" ;<script> ™@\t SELECT ", " ;<script> ™@\t SELECT ", " ;<script> ™@\t SELECT ", " ;<script> ™@\t SELECT ", " ;<script> ™@\t SELECT ",],
      ["01234567890123456789", "0000-13-32", "-1", "-1", "-1"],
      ["a", "2000/01/01", "a", "a", "a"],
      ["a", "2000-02-29", "a", "a", "a"],
      ["a", "2000-04-31", "a", "a", "a"],
      ["a", "0000-01-01", "a", "a", "a"],
      ["1000.5,0", "2000-02-30", "1000.5,0", "1000.5,0", "1000.5,0"],
      ["2.5.5", old150minus1, "2.5.5", "2.5.5", "2.5.5"],

      ["placebo", todayStr, "4", "199", "0"],
      ["placebo", tomorrow, "5", "200", "1"],
      ["placebo", old150, "500", "1000", "5"],
      ["placebo", old150minus1, "501", "1001", "6"],

      ["aspirin", year12, "39", "324", "0"],
      ["aspirin", year12plus1, "40", "325", "1"],
      ["aspirin", old150, "500", "1000", "4"],
      ["aspirin", old150minus1, "501", "1001", "5"],

      ["ibuprofen", month6, "4", "199", "0"],
      ["ibuprofen", month6plus1, "5", "200", "1"],
      ["ibuprofen", old150, "500", "800", "4"],
      ["ibuprofen", old150minus1, "501", "801", "5"],
      ["ibuprofen", month6, "6", "240", "1"],
      ["ibuprofen", month6, "6", "241", "1"],

      ["paracetamol", month3, "4", "324", "0"],
      ["paracetamol", month3plus1, "5", "325", "1"],
      ["paracetamol", old150, "501", "1000", "4"],
      ["paracetamol", old150minus1, "500", "1001", "5"],
      ["paracetamol", month6, "6", "450", "1"],
      ["paracetamol", month6, "6", "500", "1"],

      ["naproxen", year12, "39", "219", "0"],
      ["naproxen", year12plus1, "40", "220", "1"],
      ["naproxen", old150, "500", "550", "3"],
      ["naproxen", old150minus1, "501", "551", "4"],
    ];
    
    const fieldNames = [
      "medication",
      "dateOfBirth",
      "weight",
      "dosage",
      "frequency",
    ];
    const delayMs = 1000;

    testData.forEach((row, index) => {
      const data = {};
      console.log(row);
      fieldNames.forEach((name, i) => {
        data[name] = row[i];
      });
      setTimeout(() => {
        TEST.fillAndSubmit(data);
      }, index * delayMs);
    });
  })();
