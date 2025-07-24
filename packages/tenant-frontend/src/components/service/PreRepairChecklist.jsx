import { useEffect } from 'react';
import { Label, Switch } from 'ui-library';

const CHECKLIST_ITEMS = [
  { key: 'powerOn', label: 'Device Powers On?', required: true },
  { key: 'screenCracked', label: 'Screen Cracked?', required: true },
  { key: 'waterDamage', label: 'Visible Water Damage?', required: true },
  { key: 'buttonsFunctional', label: 'All Buttons Functional?', required: true },
];

const getDefaultChecklistState = () => {
  const state = {};
  CHECKLIST_ITEMS.forEach((item) => {
    state[item.key] = false;
  });
  return state;
};

const PreRepairChecklist = ({ checklistData, setChecklistData }) => {
  // Initialize checklistData if not already set
  useEffect(() => {
    const defaultState = getDefaultChecklistState();
    const isChecklistEmpty = !checklistData || Object.keys(checklistData).length === 0;

    if (isChecklistEmpty) {
      setChecklistData(defaultState);
    } else {
      // Fill any missing keys (e.g., user skipped a field before)
      const filledState = { ...defaultState, ...checklistData };
      setChecklistData(filledState);
    }
  }, []);

  const handleChecklistChange = (key, value) => {
    setChecklistData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
      {CHECKLIST_ITEMS.map((item) => (
        <div key={item.key} className='flex items-center justify-between p-3 bg-slate-800 rounded-md'>
          <Label htmlFor={item.key} className='font-medium'>
            {item.label}
            {item.required && <span className='text-red-500 ml-1'>*</span>}
          </Label>
          <Switch
            id={item.key}
            checked={checklistData?.[item.key] || false}
            onCheckedChange={(checked) => handleChecklistChange(item.key, checked)}
          />
        </div>
      ))}
    </div>
  );
};

export default PreRepairChecklist;
